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


var MAX_ZOOM = 100, MIN_ZOOM = -MAX_ZOOM;
var deepest = 0;
function zoom(x, y, scale, fleeting) {
    var center = createSVGPoint(x, y).matrixTransform(svg.getCTM().multiply(transformation).inverse());
    console.log(center);
    var world = $('#world');
    var transform = transformation
        .translate(center.x, center.y)
        .scale(scale)
        .translate(-center.x, -center.y);
    var zoom = Math.log(getScale(transform)) / Math.LN2;

    if (zoom < MIN_ZOOM || zoom > MAX_ZOOM) return;

    transformSVG(world, transform);
    if (!fleeting) transformation = transform;

    while (deepest <= zoom + 2) {
        createSVG('rect')
            .attr('width', 1 / Math.pow(2, deepest))
            .attr('height', 1 / Math.pow(2, deepest))
            .attr('fill', deepest % 2 ? 'white' : 'red')
            .appendTo(world);
        deepest++;
    }
}


$(function() {
    svg = $('#svg')[0];
    transformation = svg.createSVGMatrix();

    zoom(0, 0, 1);

    $(svg).on('mouseup', function(event) {
        var parent = $(this).parent().offset();
        console.log(event);
        var x = event.pageX - parent.left;
        var y = event.pageY - parent.top;
        var center = createSVGPoint(x, y).matrixTransform(svg.getCTM().inverse());
        console.log(center);
    }).on('mousewheel', function(event, delta) {
        event.preventDefault();
        var parent = $(this).parent().offset();
        zoom(event.pageX - parent.left,
             event.pageY - parent.top,
             Math.pow(1.01, delta));
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
