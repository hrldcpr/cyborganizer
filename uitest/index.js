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

function getTranslation(matrix) {
    return createSVGPoint(matrix.e, matrix.f); // we only do translation and uniform scaling
}

function fromPixel(x, y) {
    return createSVGPoint(x, y).matrixTransform($('#world')[0].getScreenCTM().inverse());
}

function fromPixelDelta(dx, dy) {
    var zero = fromPixel(0, 0);
    var delta = fromPixel(dx, dy);
    return createSVGPoint(delta.x - zero.x, delta.y - zero.y);
}

var squares = {};
function getSquare(x, y, z) {
    var scale = Math.pow(2, z);
    if (x < 0 || x >= scale || y < 0 || y >= scale || z < 0) return;

    var key = x + ',' + y + ',' + z;
    if (!squares[key]) {
        // we will create all four subsquares of parent, so move to top-left subsquare:
        x = 2 * Math.floor(x / 2);
        y = 2 * Math.floor(y / 2);
        var parent = getSquare(x / 2, y / 2, z - 1);
        var children = parent.getChildren();

        var k = 0;
        for (var j = 0; j < 2; j++) {
            for (var i = 0; i < 2; i++)
                createSquare(x + i, y + j, z, children[k++]);
        }
    }
    return squares[key];
}

function createSquare(x, y, z, square) {
    var key = x + ',' + y + ',' + z;
    if (squares[key]) throw 'createSquare called on existing key ' + key;
    squares[key] = square;

    var scale = Math.pow(2, z);
    createSVG('rect')
        .attr('x', x / scale)
        .attr('y', y / scale)
        .attr('width', 1 / scale)
        .attr('height', 1 / scale)
        .attr('fill', square.outer)
        .appendTo('#world');

    var poly = square.getPolygon();
    if (poly) {
        if (!square.inner) throw 'squares should have an inner color if and only if they have a line';

        var polyString = '';
        $.each(poly, function(_, point) {
            var px = (x + point[0]) / scale;
            var py = (y + point[1]) / scale;
            polyString += px + ',' + py + ' ';
        });
        createSVG('polygon')
            .attr('points', polyString)
            .attr('fill', square.inner)
            .appendTo('#world');
    }
}

function draw(x, y, zoom) {
    // draw everything subzoom levels beyond current zoom:
    var subzoom = 4;
    var n = Math.pow(2, subzoom);
    zoom = Math.floor(zoom) + subzoom;
    var scale = Math.pow(2, zoom);
    x = Math.floor(x * scale);
    y = Math.floor(y * scale);
    for (var j = 0; j < n; j++) {
        for (var i = 0; i < n; i++)
            getSquare(x + i, y + j, zoom);
    }
}

function translate(dx, dy, fleeting) {
    var fleetingTransformation = transformation.translate(dx, dy);

    transformSVG($('#world'), fleetingTransformation);
    if (!fleeting) transformation = fleetingTransformation;

    var translation = getTranslation(fleetingTransformation);
    var scale = getScale(fleetingTransformation);
    draw(-translation.x / scale, -translation.y / scale, Math.log(scale) / Math.LN2);
}

var MAX_ZOOM = 100, MIN_ZOOM = -MAX_ZOOM;
function zoom(x, y, scale, fleeting) {
    var fleetingTransformation = transformation
        .translate(x, y).scale(scale).translate(-x, -y);
    var zoom = Math.log(getScale(fleetingTransformation)) / Math.LN2;

    if (zoom < MIN_ZOOM || zoom > MAX_ZOOM) return;

    transformSVG($('#world'), fleetingTransformation);
    if (!fleeting) transformation = fleetingTransformation;

    draw(x, y, zoom);
}


$(function() {
    svg = $('#svg')[0];
    transformation = svg.createSVGMatrix();

    createSquare(0, 0, 0, rootSquare);
    zoom(0, 0, 1);

    $(svg).on('mousewheel', function(event, delta) {
        event.preventDefault();
        var point = fromPixel(event.clientX, event.clientY);
        zoom(point.x, point.y, Math.pow(1.01, delta));
    }).hammer({
        drag_block_horizontal: true,
        drag_block_vertical: true,
        transform_always_block: true
    }).on('drag', function(event) {
        var delta = fromPixelDelta(event.gesture.deltaX, event.gesture.deltaY);
        translate(delta.x, delta.y, true);
    }).on('dragend', function(event) {
        var delta = fromPixelDelta(event.gesture.deltaX, event.gesture.deltaY);
        translate(delta.x, delta.y, false);
    }).on('transform', function(event) {
        var point = fromPixel(event.gesture.center.pageX, event.gesture.center.pageY);
        zoom(point.x, point.y, event.gesture.scale, true);
    }).on('transformend', function(event) {
        var point = fromPixel(event.gesture.center.pageX, event.gesture.center.pageY);
        zoom(point.x, point.y, event.gesture.scale, false);
    });
});


//********************//
}(this, this.document));
