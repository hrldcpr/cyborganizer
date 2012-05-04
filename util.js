function stopPropagation(event) {
	event.stopPropagation();
}

function stopPropagationAndPreventDefault(event) {
	event.stopPropagation();
	event.preventDefault();
}

function simpleClick(e, handler) {
	function start(event) {
		e.bind('touchend', end);
		e.bind('mouseup', end);
		event.stopPropagation();
		event.preventDefault();
	}
	function end(event) {
		e.unbind('touchend', end);
		e.unbind('mouseup', end);
		handler(event);
		event.stopPropagation();
		event.preventDefault();
	}

	e.bind('touchstart', start);
	e.bind('mousedown', start);
}

function percent(x) {
	return (x * 100) + '%';
}

// inverse of percent(), i.e. fraction(percent(x))==x:
function fraction(s) {
	// parseFloat() already stops at first non-numeric character:
	return parseFloat(s) / 100.0;
}

function byte(x) {
    return Math.floor( x*256 );
}

function bool(x) {
	return x ? true : false;
}

function magnitude(dx, dy) {
	return Math.sqrt(dx*dx + dy*dy);
}

function constant(x) {
	return function() {
		return x;
	}
}
