(function(window, document, undefined) {
//************************************//


var svg, transformation; // set onready

function createSVG(tag) {
    return $(document.createElementNS('http://www.w3.org/2000/svg', tag));
}

function createSVGPoint(x, y) {
    var point = svg.createSVGPoint();
    point.x = x;
    point.y = y;
    return point;
}

function transformSVG(node, matrix) {
    node.attr('transform', 'matrix('
              + matrix.a + ' ' + matrix.b + ' '
              + matrix.c + ' ' + matrix.d + ' '
              + matrix.e + ' ' + matrix.f + ')');
}

function getScale(matrix) {
    return matrix.a; // we only do translation and uniform scaling
}

function fromPixel(x, y) {
    return createSVGPoint(x, y).matrixTransform($('#world')[0].getScreenCTM().inverse());
}

var squares = {};
function createSquare(x, y, z) {
    var key = x + ',' + y + ',' + z;
    if (!squares[key]) {
        var scale = Math.pow(2, z);
        squares[key] = createSVG('rect')
            .attr('x', x / scale)
            .attr('y', y / scale)
            .attr('width', 1 / scale)
            .attr('height', 1 / scale)
            .attr('fill', z % 2 ? 'white' : 'red')
            .appendTo('#world');
    }
}


var MAX_ZOOM = 100, MIN_ZOOM = -MAX_ZOOM;
function zoom(x, y, scale, fleeting) {
    var fleetingTransformation = transformation
        .translate(x, y).scale(scale).translate(-x, -y);
    var zoom = Math.log(getScale(fleetingTransformation)) / Math.LN2;

    if (zoom < MIN_ZOOM || zoom > MAX_ZOOM) return;

    transformSVG($('#world'), fleetingTransformation);
    if (!fleeting) transformation = fleetingTransformation;

    for (var z = 0; z <= zoom; z++) {
        var scale = Math.pow(2, z);
        createSquare(Math.floor(x * scale), Math.floor(y * scale), z);
    }
}


$(function() {
    svg = $('#svg')[0];
    transformation = svg.createSVGMatrix();

    zoom(0, 0, 1);

    $(svg).on('mousewheel', function(event, delta) {
        event.preventDefault();
        var point = fromPixel(event.clientX, event.clientY);
        zoom(point.x, point.y, Math.pow(1.01, delta));
    }).hammer({
        transform_always_block: true
    }).on('transform', function(event) {
        zoom(0, 0, event.gesture.scale, true);
    }).on('transformend', function(event) {
        zoom(0, 0, event.gesture.scale, false);
    });
});


//********************//
}(this, this.document));
