const WHEEL_RATE = 1.01;
const SCROLL_TIMEOUT = 1000;

function makeGeometry(width, height, fixed, left, top) {
	return {
		width:  width,
		height: height,
		fixed:  fixed,
		left:   left,
		top:    top,
		scale:  1.0,
		theta:  0.0,
		zIndex: 0
	};
}

function restrictThing(geometry) {
	var left = geometry.left, top = geometry.top,
		width = geometry.scale * geometry.width,
		height = geometry.scale * geometry.height;

	if (left < 0)			left	= 0;
	if (width > 1)			width	= 1;
	if (left + width > 1)	left	= 1 - width;
	if (top < 0)			top		= 0;
	if (height > 1)			height	= 1;
	if (top + height > 1)	top		= 1 - height;

	geometry.left = left;
	geometry.top = top;
	geometry.scale = Math.min(width/geometry.width, height/geometry.height);

	return geometry;
}

function restrictPile(geometry) {
	var left = geometry.left, top = geometry.top,
		width = geometry.scale * geometry.width,
		height = geometry.scale * geometry.height;

	if (left > 0)			left	= 0;
	if (width < 1)			width	= 1;
	if (left + width < 1)	left	= 1 - width;
	if (top > 0)			top		= 0;
	if (height < 1)			height	= 1;
	if (top + height < 1)	top		= 1 - height;

	geometry.left = left;
	geometry.top = top;
	geometry.scale = Math.min(width/geometry.width, height/geometry.height);

	return geometry;
}

var zIndex = 1;
var touchCapable = false;
var selected = null;
var canSelect = true;

// INPUT ATTRIBUTES:
// .parent() accessor
// .geometry() accessor
// .selected() callback
// .clicked(x,y) callback
// .deselected() callback
// .moved() callback, called when geometry is changed, but shouldn't yet be stored
// .save() callback, called when geometry and content should be stored
// .remove() callback, called when thing should be deleted
// OUTPUT ATTRIBUTES:
// .div() accessor
// .x(x) converts pageX to relative width
// .y(y) converts pageY to relative height
// .select() selects
// .deselect() deselects
function makeThingUI(thing) {

    var div = $('<div class="thing"/>');
	thing.div = constant(div);
	
	var parent = thing.parent();
	var geometry = thing.geometry();
	
	// keep track of largest zIndex:
	if (geometry.zIndex > zIndex)
		zIndex = geometry.zIndex;
	
	
	var innerRemove = thing.remove;
	thing.remove = function() {
		div.remove();
		if (innerRemove) innerRemove();
	};

	var innerMoved = thing.moved;
	thing.moved = function() {
		if (innerMoved) innerMoved();
		
		div.css({
			width:    percent(geometry.scale * geometry.width),
			height:   percent(geometry.scale * geometry.height),
			left:     percent(geometry.left),
			top:      percent(geometry.top),
			zIndex:   geometry.zIndex,
			fontSize: percent(geometry.scale * geometry.height)
		});
	};	
	
	thing.x = function(x) {
		return (parent.x(x) - geometry.left) / geometry.width / geometry.scale;
	};	

	thing.y = function(y) {
		return (parent.y(y) - geometry.top) / geometry.height / geometry.scale;
	};
	
	thing.select = function() {
		if (thing!==selected) {
			if (selected)
				selected.deselect();

			selected = thing;

			div.addClass('selected');
		    div.bind('touchstart', handleTouchStart);
			div.bind('mousedown', handleMouseDown);
			div.bind('mousewheel', handleMouseWheel);

			// bring to front:
			if (geometry.zIndex < zIndex) {
				zIndex++;
				geometry.zIndex = zIndex;
				thing.moved();
			}

			if (thing.selected) thing.selected();
		}
	};
	
	thing.deselect = function() {
		if (thing===selected) {
			selected = null;

			div.removeClass('selected');
		    div.unbind('touchstart', handleTouchStart);
			div.unbind('mousedown', handleMouseDown);
			div.unbind('mousewheel', handleMouseWheel);

			if (thing.deselected) thing.deselected();
		}
	};


	var x0, y0, gesture;

	function pointerStart(x, y, afterGesture) {
		gesture = bool(afterGesture); // (in case afterGesture is undefined)
	
		x0 = thing.x(x);
		y0 = thing.y(y);
	}

	function pointerMove(x, y) {
		gesture = true; // drag counts as 'gesture'
		canSelect = false;

		// move geometry such that (x,y) again lines up with (x0,y0),
		// by converting distance to parent coordinates:
		geometry.left += (thing.x(x) - x0) * geometry.width * geometry.scale;
		geometry.top += (thing.y(y) - y0) * geometry.height * geometry.scale;
		thing.moved();
	}

	function pointerEnd() {
		if (thing===selected) { // child might have been selected during this event
			if (gesture) {
				if (thing.save) thing.save();
			}
			else {
				if (thing.clicked) thing.clicked(x0, y0);
			}
		
			canSelect = true;
		}
	}
	
	
	var xA0, yA0, xB0, yB0, scale0, width0, height0;
	
	function gestureStart(xA, yA, xB, yB) {
		gesture = true;
		canSelect = false;
		
		scale0 = geometry.scale;
		width0 = geometry.width;
		height0 = geometry.height;
		
		xA0 = thing.x(xA);
		yA0 = thing.y(yA);
		xB0 = thing.x(xB);
		yB0 = thing.y(yB);
	}
	
	function gestureMove(xA, yA, xB, yB) {
		// TODO make !geometry.fixed work better; for now we always fix ratio
		if (true || geometry.fixed) { // can't change aspect ratio
			var d0 = magnitude(xA0 - xB0, yA0 - yB0);
			var d = magnitude(thing.x(xA) - thing.x(xB), thing.y(yA) - thing.y(yB));
			geometry.scale *= Math.max(d/d0, 0.5);
		}
		else {
			var kx = (thing.x(xB) - thing.x(xA)) / (xB0 - xA0);
			geometry.width *= Math.max(kx, 0.5);
			var ky = (thing.y(yB) - thing.y(yA)) / (yB0 - yA0);
			geometry.height *= Math.max(ky, 0.5);
		}
		
		geometry.left += (thing.x(xA) - xA0 + thing.x(xB) - xB0) * geometry.width * geometry.scale / 2;
		geometry.top += (thing.y(yA) - yA0 + thing.y(yB) - yB0) * geometry.height * geometry.scale / 2;

		thing.moved();
	}


    function handleTouchStart(event) {
		touchCapable = true;
		
		var touches = event.originalEvent.touches;
		// console.log('touchstart'); $.each(touches, function (i,x) {console.log(x.identifier);});
		if (touches.length===0)
			throw "empty touchStart";
		else if (touches.length===1) {
			pointerStart(touches[0].pageX, touches[0].pageY);

			$(window).bind('touchmove', handleTouchMove);
			$(window).bind('touchend', handleTouchEnd);
		}
		else if (touches.length===2)
			gestureStart(touches[0].pageX, touches[0].pageY, touches[1].pageX, touches[1].pageY);
	
		event.stopPropagation();
		event.preventDefault();
    }

    function handleTouchMove(event) {
		var touches = event.originalEvent.touches;
		// console.log('touchmove'); $.each(touches, function (i,x) {console.log(x.identifier);});
		if (touches.length===0)
			throw "empty touchMove";
		else if (touches.length===1)
			pointerMove(touches[0].pageX, touches[0].pageY);
		else
			gestureMove(touches[0].pageX, touches[0].pageY, touches[1].pageX, touches[1].pageY);
		
		event.stopPropagation();
		event.preventDefault();
    }

    function handleTouchEnd(event) {
		var touches = event.originalEvent.touches;
		// console.log('touchend'); $.each(touches, function (i,x) {console.log(x.identifier);});
		if (touches.length===0) {
			$(window).unbind('touchmove', handleTouchMove);
			$(window).unbind('touchend', handleTouchEnd);
			
			pointerEnd();
		}
		else if (touches.length===1)
			pointerStart(touches[0].pageX, touches[0].pageY, true);
		
		event.stopPropagation();
		event.preventDefault();
    }


	function handleMouseDown(event) {
		if (!touchCapable) {
			pointerStart(event.pageX, event.pageY);

			$(window).bind('mousemove', handleMouseMove);
			$(window).bind('mouseup', handleMouseUp);
			
			event.stopPropagation();
			event.preventDefault();
		}
    }

    function handleMouseMove(event) {
		pointerMove(event.pageX, event.pageY);
		
		event.stopPropagation();
		event.preventDefault();
    }

    function handleMouseUp(event) {
		$(window).unbind('mousemove', handleMouseMove);
		$(window).unbind('mouseup', handleMouseUp);

		pointerEnd();
		
		event.stopPropagation();
		event.preventDefault();
    }
	
	var scrollTimer = null;
	
	function handleMouseWheel(event) {
		// TODO simpler way to do this using just local coordinates?
		
		// mouse coordinates in parent:
		var x = parent.x(event.pageX);
		var y = parent.y(event.pageY);
		// initial mouse coordinates in thing:
		var x0 = (x - geometry.left) / geometry.width / geometry.scale;
		var y0 = (y - geometry.top) / geometry.height / geometry.scale;
	
		geometry.scale *= Math.pow(WHEEL_RATE, event.wheelDelta/120);

		// move thing such that mouse coordinates in thing are same as before scaling:
		geometry.left = x - geometry.scale * geometry.width * x0;
		geometry.top = y - geometry.scale * geometry.height * y0;

		thing.moved();
	
		if (thing.save) {
			// save after a second of not scrolling
			if (scrollTimer)
				clearTimeout(scrollTimer);
			scrollTimer = setTimeout(function() {
				scrollTimer = null;
				thing.save();
			}, SCROLL_TIMEOUT);
		}
		
		event.stopPropagation();
		event.preventDefault();
	}
	
	function handleSelect(event) {
		// make sure selected thing hasn't denied selection (e.g. during a drag or gesture; see above)
		// and that this isn't a multitouch:
		if (canSelect && !(event.originalEvent.touches && event.originalEvent.touches.length>1)) {
			thing.select();
			canSelect = false;

			// reset canSelect after this event is over:
			setTimeout(function() {canSelect = true;}, 0);
		}
	}

    thing.moved();

	div.bind('mouseup', handleSelect);
	div.bind('touchend', handleSelect);

	parent.div().append( div );

    return thing;
}
