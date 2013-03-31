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
function getSquare(x, y, z) {
    var scale = Math.pow(2, z);
    if (x < 0 || x >= scale || y < 0 || y >= scale || z < 0) return;

    var key = x + ',' + y + ',' + z;
    if (!squares[key]) {
        // we will create all four subsquares of parent, so move to top-left subsquare:
        x = 2 * Math.floor(x / 2);
        y = 2 * Math.floor(y / 2);
        var parent = getSquare(x / 2, y / 2, z - 1);
        var children = SPLITS[parent];
        var child = children[Math.floor(children.length * Math.random())];
        var k = 0;
        for (var j = 0; j < 2; j++) {
            for (var i = 0; i < 2; i++)
                createSquare(x + i, y + j, z, child[k++]);
        }
    }
    return squares[key];
}

function createSquare(x, y, z, line) {
    var key = x + ',' + y + ',' + z;
    if (squares[key]) { console.log('createSquare called on existing key ' + key); return; }
    squares[key] = line;

    var scale = Math.pow(2, z);
    createSVG('rect')
        .attr('x', x / scale)
        .attr('y', y / scale)
        .attr('width', 1 / scale)
        .attr('height', 1 / scale)
        .attr('fill', 'blue')
        .appendTo('#world');

    line = LINES[line];
    if (line) {
        var corners = [[0, 0], [1/scale, 0],
                       [0, 1/scale], [1/scale, 1/scale]];
        line = [corners[line[0]], corners[line[1]]];
        createSVG('line')
            .attr('x1', x/scale + line[0][0])
            .attr('y1', y/scale + line[0][1])
            .attr('x2', x/scale + line[1][0])
            .attr('y2', y/scale + line[1][1])
            .attr('stroke-width', 0.05 / scale)
            .attr('stroke', 'red')
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


$(function() {
    svg = $('#svg')[0];
    transformation = svg.createSVGMatrix();

    createSquare(0, 0, 0, ' ');
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
