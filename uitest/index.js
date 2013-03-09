(function(window, document, undefined) {
//************************************//


function svg(tag) {
    return $(document.createElementNS('http://www.w3.org/2000/svg', tag));
}

var MAX_ZOOM = 100, MIN_ZOOM = -MAX_ZOOM;
var deepest = 0;
function zoom(scale, fleeting) {
    var world = $('#world');
    scale *= world.data('scale') || 1;
    var zoom = Math.log(scale) / Math.LN2;

    if (zoom < MIN_ZOOM || zoom > MAX_ZOOM) return;

    world.attr('transform', 'scale(' + scale + ',' + scale + ')');
    if (!fleeting) world.data('scale', scale)

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
