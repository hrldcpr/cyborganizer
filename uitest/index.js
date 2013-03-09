(function(window, document, undefined) {
//************************************//


function svg(tag) {
    return $(document.createElementNS('http://www.w3.org/2000/svg', tag));
}

function svgMatrix(matrix) {
    return 'matrix('
        + matrix[0][0] + ' ' + matrix[1][0] + ' '
        + matrix[0][1] + ' ' + matrix[1][1] + ' '
        + matrix[0][2] + ' ' + matrix[1][2] + ')';
}

function scaleMatrix(scale) {
    return numeric.diag([scale, scale, 1]);
}

function getScale(matrix) {
    // the x-coordinate of a vector is scaled by this amount,
    // and we always scale uniformly, so this is the scale:
    return numeric.norm2([matrix[0][0], matrix[1][0]]);
}


var MAX_ZOOM = 100, MIN_ZOOM = -MAX_ZOOM;
var transformation = numeric.identity(3);
var deepest = 0;
function zoom(scale, fleeting) {
    var world = $('#world');
    var transform = numeric.dot(transformation, scaleMatrix(scale));
    var zoom = Math.log(getScale(transform)) / Math.LN2;

    if (zoom < MIN_ZOOM || zoom > MAX_ZOOM) return;

    world.attr('transform', svgMatrix(transform));
    if (!fleeting) transformation = transform;

    while (deepest <= zoom + 2) {
        svg('rect')
            .attr('width', 1 / Math.pow(2, deepest))
            .attr('height', 1 / Math.pow(2, deepest))
            .attr('fill', deepest % 2 ? 'white' : 'red')
            .appendTo(world);
        deepest++;
    }
}


$(function() {

    zoom(1);

    $('svg').on('mousewheel', function(event, delta) {
        event.preventDefault();
        zoom(Math.pow(1.01, delta));
    }).hammer({
        transform_always_block: true
    }).on('transform', function(event) {
        zoom(event.gesture.scale, true);
    }).on('transformend', function(event) {
        zoom(event.gesture.scale, false);
    });

});


//********************//
}(this, this.document));
