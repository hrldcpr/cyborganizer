$(function() {
//////////////


function createSVG(tag) {
    return $(document.createElementNS('http://www.w3.org/2000/svg', tag));
}

var deepest = 1;
function zoom(scale, fleeting) {
    var scale0 = $('#world').data('scale') || 1;
    scale *= scale0;

    $('#world').attr('transform', 'scale(' + scale + ',' + scale + ')');
    if (!fleeting) $('#world').data('scale', scale)

    while (scale >= deepest) {
        deepest *= 2;
        createSVG('rect')
            .attr('width', 1 / deepest)
            .attr('height', 1 / deepest)
            .attr('fill', 'rgb(' + Math.floor(256*Math.random())
                  + ',' + Math.floor(256*Math.random())
                  + ',' + Math.floor(256*Math.random()) +')')
            .appendTo('#world');
    }
}

zoom(1);

$('svg').on('mousewheel', function(event, delta) {
    event.preventDefault();
    zoom(Math.pow(1.01, delta));
});

$('svg').hammer({
    transform_always_block: true
}).on('transform', function(event) {
    zoom(event.gesture.scale, true);
}).on('transformend', function(event) {
    zoom(event.gesture.scale, false);
});


///
});
