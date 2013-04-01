
var OCEAN = '#004040';

function colorComponent(x) {
    x = Math.round(255 * x).toString(16);
    if (x.length < 2) x = '0' + x;
    return x;
}

function colorString(r, g, b) {
    return '#' + colorComponent(r) + colorComponent(g) + colorComponent(b);
}


// 90 degree rotations:
var ROTATED = {' ': ' ',
	       ']': '‾',
	       '‾': '[',
	       '[': '_',
	       '_': ']',
	       '/': '\\',
	       '\\': '/',
	       0: 1,
	       1: 3,
	       3: 2,
	       2: 0};
var UNROTATED = {};
for (var k in ROTATED)
    UNROTATED[ROTATED[k]] = k;


function opposite(s) {
    return ROTATED[ROTATED[s]];
}

// 90 degree rotation of a 4-square:
function rotate(child) {
    var rotated = '';
    for (var i = 0; i < 4; i++)
	rotated += ROTATED[child[UNROTATED[i]]];
    return rotated;
}

// lines on a 1-square in terms of 4-squares:
var LINES = {};
function addLines(side, line) {
    for (var i = 0; i < 4; i++) { // 0, 90, 180, and 270 degrees
	LINES[side] = line;
	side = ROTATED[side];
	line = [ROTATED[line[0]], ROTATED[line[1]]];
    }
}
addLines('‾', [0, 1]);
addLines('/', [2, 1]);

// 4-square neighbors via sides:
// e.g. NEIGHBORS[0][1] == '[' and SIDES[0]['['] == 1
var NEIGHBORS = {0: {}, 1: {}, 2: {}, 3: {}};
var SIDES = {0: {}, 1: {}, 2: {}, 3: {}};
$.each(LINES, function(side, line) {
	if (side != '/' && side != '\\') {
	    side = ROTATED[side];
	    NEIGHBORS[line[0]][line[1]] = side;
	    NEIGHBORS[line[1]][line[0]] = opposite(side);
	    SIDES[line[0]][side] = line[1];
	    SIDES[line[1]][opposite(side)] = line[0];
	}
    });

// ways to split 1-squares into 4-squares, excluding rotations which we automatically add:
var SPLITS = {};
function addSplits(parent, children) {
    for (var i = 0; i < 4; i++) { // 0, 90, 180, and 270 degrees
        // don't add duplicate children:
        if (!SPLITS[parent]) SPLITS[parent] = children;
        else $.each(children, function(_, child) {
            if (SPLITS[parent].indexOf(child) < 0) SPLITS[parent].push(child);
        });

        parent = ROTATED[parent];
        children = $.map(children, rotate);
    }
}
addSplits(' ', ['\
  \
  ',
		'\
/]\
‾ ',
		'\
/\\\
‾‾',
		'\
/\\\
\\/']);
addSplits(']', ['\
] \
] ',
		'\
\\ \
/ ',
		'\
‾\\\
_/']);
addSplits('/', ['\
 /\
/ ',
		'\
/‾\
] ']);

$.each(SPLITS, function(parent, children) {
    var s = '';
    s += ' _ ' + '  ';
    $.each(children, function(_, child) {
        s += ' __ ';
    });
    s += '\n';

    s += '|' + parent + '|' + '=>';
    $.each(children, function(_, child) {
        s += '|' + child[0] + child[1] + '|';
    });
    s += '\n';

    s += ' ‾ ' + '  ';
    $.each(children, function(_, child) {
        s += '|' + child[2] + child[3] + '|';
    });
    s += '\n';

    s += '   ' + '  ';
    $.each(children, function(_, child) {
        s += ' ‾‾ ';
    });
    s += '\n';
    console.log(s);
});

function ifirst(xs) {
    for (x in xs)
        return x;
}

function interpolate(p, q, x) {
    return $.map(p, function(_, i) {
        return (1 - x)*p[i] + x*q[i];
    });
}

// class CornerLineSquare(square.Square):
//     class Value:
//         """inner is the color to the right of line
//         and outer is the color of the rest of the square.
//         line is one of ' ', '‾', '[', '_', ']', '/', '\\'"""
//         def __init__(self, outer=biome.OCEAN, inner=None, line=' '):
//             if (line == ' ' and inner) or not (line == ' ' or inner):
//                 raise ValueError('squares have an inner color if and only if they have a line')
//             self.outer = outer
//             self.inner = inner
//             self.line = line

//     DEFAULT = Value()

//     def get_child_values(self):
//         if not self.parent: # at root, split to least empty space:
//             _,values = min((v.count(' '), v) for v in SPLITS[self.value.line])
//         else:
//             values = random.choice(tuple(SPLITS[self.value.line]))
//         inner = (random.random(), random.random(), random.random())
//         return tuple(CornerLineSquare.Value(self.value.outer, None if v == ' ' else inner, v)
//                      for v in values)

//     def draw(self, surface):
//         w = surface.get_width() - 2
//         h = surface.get_height() - 2
//         surface.fill((64, 64, 128))
//         pygame.draw.rect(surface, (64,64,64),
//                          (1, 1, w, h))
//         line = LINES[self.value.line]
//         if line:
//             corners = [(1, 1), (w, 1),
//                        (1, h), (w, h)]
//             pygame.draw.line(surface, (255,255,255),
//                              corners[line[0]], corners[line[1]])


function Point(child, side, x) {
    // child in (0, 1, 2, 3) specifies the child id,
    // side in (']', '‾', '[', '_') specifies side of the square
    // and x between 0.0 and 1.0 specifies distance along the side
    if ([0, 1, 2, 3].indexOf(child) < 0)
        throw 'invalid child id: ' + child;
    if ([']', '‾', '[', '_'].indexOf(side) < 0)
        throw 'side=' + side + ' not a valid side';
    if (x < 0 || x > 1)
        throw 'x=' + x +' not in [0, 1]';
    this.child = child;
    this.side = side;
    this.x = x;

    this.getNeighbor = function() {
        return new Point(SIDES[this.child][this.side], opposite(this.side), 1 - this.x);
    };

    this.toChild = function() {
        // return the child point p corresponding to this point
        // note that p.side == this.side THINK ABOUT IT
        var line = LINES[this.side];
        if (this.x < 0.5)
            return new Point(line[0], this.side, 2*this.x);
        else
            return new Point(line[1], this.side, 2*this.x - 1);
    };
}

function Line(start, end) {
    if (!(start instanceof Point && end instanceof Point))
        throw 'start=' + start + ' and end=' + end + ' are not both Points';
    this.start = start;
    this.end = end;
}


function randomEndpoint(child, takenSide) {
    // return a random endpoint in the current child not on takenSide
    var sides = $.map(SIDES[child], function(_, s) { if (s != takenSide) return s; });
    var side = sides[Math.floor(sides.length * Math.random())];
    return new Point(child, side, Math.random());
}

var rootSquare = new LineSquare(OCEAN);
function LineSquare(outer, inner, line) {
    // inner is the color to the right of line
    // and outer is the color of the rest of the square
    if ((inner && !line) || (line && !inner))
        throw 'squares have an inner color if and only if they have a line';
    this.outer = outer;
    this.inner = inner;
    this.line = line;

    this.getChildren = function() {
        if (this == rootSquare) P = 1; // root always becomes an island
        else P = this.outer == OCEAN ? 0 : 0.5; // non-root ocean never becomes island

        var start, end, inner, outer;
        if (this.line) {
            // endpoints of children's lines must coincide with parent:
            start = this.line.start.toChild();
            end = this.line.end.toChild();
            inner = this.inner;
        } else if (Math.random() < P) { // probability of empty square becoming a loop
            // lines in an empty parent must form a clockwise loop:
            // only possible loop is through all 4 squares, so we start clockwise from 0:
            start = new Point(0, '_', Math.random());
            end = start.getNeighbor();
            inner = colorString(Math.random(), Math.random(), Math.random());
        } else { // empty children for empty parent
            // don't copy root since it gets special treatment:
            var copy = this != rootSquare ? this : new LineSquare(this.inner, this.outer, this.line);
            return [copy, copy, copy, copy];
        }

        var children = {};
        var n = 0;
        function store(p) {
            if (!children[p.child]) {
                children[p.child] = [];
                n++;
            }
            children[p.child].push(p);
        }
        store(start);
        var point = start;
        while (point.child != end.child) {
            // note that this will definitely reach end,
            // because there are only two internal sides per square and one will be taken,
            // so we will not loop back.
            point = randomEndpoint(point.child, point.side);
            store(point);
            point = point.getNeighbor();
            store(point);
        }
        store(end);

        var inside;
        if (n < 4) { // some empty children, so figure out which are inside
            if (!this.line) throw 'empty parent split into empty children';
            // assemble inside children in clockwise order:
            inside = [LINES[start.side][0], start.child,
                      end.child, LINES[end.side][1]]
            while (inside[0] != inside[inside.length - 1])
                inside.push(ROTATED[inside[inside.length - 1]]);
        }

        var values = [];
        for (var i = 0; i < 4; i++) {
            var line = children[i];
            if (line)
                values.push(new LineSquare(this.outer, inner,
                                           new Line(line[0], line[1])));
            else
                values.push(new LineSquare(inside.indexOf(i) >= 0 ? inner : this.outer));
        }
        return values;
    };

    this.getPolygon = function() {
        if (!this.line) return;

        var corners = [[0, 0], [1, 0],
                       [0, 1], [1, 1]];
        var poly = [];

        var line = LINES[this.line.start.side];
        poly.push(corners[line[0]]);
        var start = interpolate(corners[line[0]], corners[line[1]], this.line.start.x);
        poly.push(start);

        line = LINES[this.line.end.side];
        var end = interpolate(corners[line[0]], corners[line[1]], this.line.end.x);
        poly.push(end);

        // close the polygon, clockwise:
        var child = line[1];
        while (poly[0] != poly[poly.length - 1]) {
            poly.push(corners[child]);
            child = ROTATED[child];
        }

        return poly;
    };
}
