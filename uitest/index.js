$(function() {

function zoom(scale, fleeting) {
    var scale0 = $('#world').data('scale') || 1;
    scale *= scale0;

    $('#world').attr('transform', 'scale(' + scale + ',' + scale + ')');
    if (!fleeting) $('#world').data('scale', scale)
}

$('svg').on('mousewheel', function(event, delta) {
    event.preventDefault();

    zoom(Math.pow(1.01, delta));
});

$('svg').hammer({transform_always_block: true}).on('transform', function(event) {
    zoom(event.gesture.scale, true);
}).on('transformend', function(event) {
    zoom(event.gesture.scale, false);
});

});
