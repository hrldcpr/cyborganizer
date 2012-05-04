var username = 'harold';

var innerDB = $.couch.db('pile');
var db = cacheDB( innerDB );

// innerDB.deleteDb();
// innerDB.createDb();
// innerDB.save({
//  _id: "_design/things",
//  views: {
//    "byOwner": {
//        "map": "function(doc) {if(doc.owner) emit(doc.owner,null);}"
//    }
//  }
// });


const OPACITY_DESELECTED = 0.7;
const OPACITY_SELECTED = 0.9;

function createThing(doc, parent) {
	var thing = {
		parent:     constant(parent),
		geometry:   constant(doc.geometry),
		content:    constant(doc.content),

		moved:      function() {restrictThing(thing.geometry());},
		save:       function() {db.save(doc);},
		// TODO also do db.delete(doc):
		selected:   function() {thing.div().fadeTo('fast', OPACITY_SELECTED);},
		deselected: function() {thing.div().fadeTo('fast', OPACITY_DESELECTED); thing.hideEditor();},
		clicked:    click,
		remove:     remove
	};

	function click() {
		if (thing.editorVisible())
			thing.hideEditor();
		else {
			parent.geometry().scale =
				Math.min(0.8 / thing.geometry().width / thing.geometry().scale,
						0.8 / thing.geometry().height / thing.geometry().scale);
			parent.geometry().left = 0.5 - (thing.geometry().left + 0.5 * thing.geometry().width * thing.geometry().scale) * parent.geometry().width * parent.geometry().scale;
			parent.geometry().top = 0.5 - (thing.geometry().top + 0.5 * thing.geometry().height * thing.geometry().scale) * parent.geometry().height * parent.geometry().scale;
			parent.moved();
			thing.showEditor();
		}
	}

	function remove() {
		db.deleteDoc(doc);
		parent.select();
	}

	makeThingUI(thing);

	makeContentUI(thing);

	thing.div().fadeTo('slow', OPACITY_DESELECTED);

	return thing;
}

function createPile(parent) {
	var pile = {
		parent:   constant(parent),
		geometry: constant( makeGeometry(1,1,true,0,0) ),

		moved:   function() {restrictPile(pile.geometry());},
		clicked: click
	};

	// clicking in the pile creates a new thing:
	function click(x, y) {
		var size = 100;
		var width = pile.x(size) - pile.x(0);
		var height = pile.y(size) - pile.y(0);
		var doc = {
			owner:    username,
			geometry: makeGeometry(width, height, false, x - width/2, y - height/2),
			content:  makeContent()
		};

		db.save(doc);

		createThing(doc, pile);
	}

	makeThingUI(pile);

	pile.div().addClass('pile');

	pile.div().append( $('<div class="pileBackground"/>') );

	return pile;
}

var rootPile;
function makeUI() {
	var div = $('#main');
	var main = {
		div: constant(div),
		x:   function(x) {return (x - div.offset().left) / div.width();},
		y:   function(y) {return (y - div.offset().top) / div.height();}
	};

	if (rootPile) // if we're restarting
		rootPile.div().remove();
	rootPile = createPile( main );

	var offlineMap = "function(doc) {if(doc.owner) emit(doc.owner,null);}";
	var things = db.view('things/byOwner', offlineMap, [username]);
	if (things[username]) {
		$.each(things[username], function(i, doc) {
			createThing(doc, rootPile);
		});
	}

	rootPile.select();
}


// once DOM is loaded:
$(function() {
	function resize() {
		var height = $(window).height();
		var width = height * 320/480
		$('#main').css({
			width: width,
			height: height,
			left: ($(window).width() - width) / 2,
			fontSize: height
		});
	}
	resize();
	$(window).resize(resize);

	// $(window).bind('gesturestart', stopPropagationAndPreventDefault);
	$(window).bind('gesturechange', stopPropagationAndPreventDefault);
	// $(window).bind('gestureend', stopPropagationAndPreventDefault);
	// $(window).bind('touchstart', stopPropagationAndPreventDefault);
	$(window).bind('touchmove', stopPropagationAndPreventDefault);
	// $(window).bind('touchend', stopPropagationAndPreventDefault);
	// $(window).bind('mousedown', stopPropagationAndPreventDefault);
	// $(window).bind('mouseup', stopPropagationAndPreventDefault);
	// $(window).bind('click', stopPropagationAndPreventDefault);

	function flush() {
		if (navigator.onLine) {
			db.flush(); // push offline changes to server
			db.clearCache(); // keep cache from getting too big
			/* if we suddenly go offline right here, we will have no cached data :( */
			makeUI(); // reload UI; this will refill cache with whatever gets used for UI
		}
	}

	$(window).bind('online', flush); // whenever we come online, flush cache

	if (navigator.onLine)
		flush();
	else // app is starting offline -- make UI from cached stuff
		makeUI();
});
