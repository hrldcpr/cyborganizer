var K = 4;
var N = 1 << K;
var W = 600 / (N + 1);
var H = 600 / (N + 1);

var TYPES = ['ocean', 'water', 'field', 'forest', 'hill', 'mountain'];
var COLORS = ['#288', '#228', '#882', '#282', '#482', '#444']


// all lists of n numbers in {-1,0,1} which sum to total:
function deltas(n, total) {
    if (n == 0) {
	if (total == 0) return [[]];
	else return [];
    } else {
	var lists = [];
	for (var d=-1; d<=1; d++) {
	    $.each(deltas(n - 1, total - d), function(_, list) {
		list.push(d);
		lists.push(list);
	    });
	}
	return lists;
    }
}

var DELTAS = deltas(4, 0);


function choose(list) {
    return list[Math.floor(list.length * Math.random())];
}


function makeDivTile(x, y, w, h, v) {
    return $('<div class="tile"></div>')
	.css({left: x, top: y,
	      width: w, height: h})
	.addClass(TYPES[v])
	.appendTo('#div');
}

function removeDivTile(tile) {
    tile.remove();
}


function drawCanvasTile(x, y, w, h, v) {
    var ctx = document.getElementById("canvas").getContext("2d");
    ctx.fillStyle = COLORS[v];
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
}


function makeTilesWith(make, remove) {
    function makeTiles(z, x, y, v) {
	var k = 1 << (K - z);
	var i = x * k;
	var j = y * k;
	var tile = make(W * (i + 0.5), H * (j + 0.5),
			W * k, H * k,
			Math.round((COLORS.length - 1) * (v + K) / (2 * K)));

	if (z < K) {
	    setTimeout(function() {
		if (remove) remove(tile);
		var d = choose(DELTAS);
		var k = 0;
		for (var i=0; i<2; i++) {
		    for(var j=0; j<2; j++)
			makeTiles(z + 1, 2*x + i, 2*y + j,
				  v + d[k++]);
		}
	    }, 2000);
	}
    }
    makeTiles(0, 0, 0, 0);
}


$(function() {
    makeTilesWith(makeDivTile, removeDivTile);
    makeTilesWith(drawCanvasTile);
});
