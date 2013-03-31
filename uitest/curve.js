
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

// def ifirst(xs):
//     for x in xs:
//         return x

// def interpolate(p, q, x):
//     return tuple((1 - x)*a + x*b
//                  for a,b in zip(p, q))


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


// class Point:
//     """child in (0, 1, 2, 3) specifies the child id,
//     side in (']', '‾', '[', '_') specifies side of the square
//     and x between 0.0 and 1.0 specifies distance along the side"""
//     def __init__(self, child, side, x):
//         if child not in (0, 1, 2, 3):
//             raise ValueError('invalid child id: %s' % child)
//         if side not in (']', '‾', '[', '_'):
//             raise ValueError('side=%s not a valid side' % side)
//         if x < 0 or x > 1:
//             raise ValueError('x=%s not in [0, 1]' % x)
//         self.child = child
//         self.side = side
//         self.x = x

//     def get_neighbor(self):
//         return Point(SIDES[self.child][self.side], opposite(self.side), 1 - self.x)

// class Line:
//     def __init__(self, start, end):
//         if not (isinstance(start, Point) and isinstance(end, Point)):
//             raise ValueError('start=%s and end=%s are not both Points' % (start, end))
//         self.start = start
//         self.end = end

// def parent_to_child(p):
//     """return the child point q corresponding to p in the parent.
//     note that q.side == p.side THINK ABOUT IT"""

//     a,b = LINES[p.side]
//     if p.x < 0.5:
//         return Point(a, p.side, 2*p.x)
//     else:
//         return Point(b, p.side, 2*p.x - 1)

// def random_endpoint(child, taken_side=None):
//     """return a random endpoint in the current child not on taken_side"""
//     sides = [s for s in SIDES[child] if s != taken_side]
//     return Point(child, random.choice(sides), random.random())

// class LineSquare(square.Square):
//     class Value:
//         """inner is the color to the right of line
//         and outer is the color of the rest of the square"""
//         def __init__(self, outer=biome.OCEAN, inner=None, line=None):
//             if any((inner, line)) and not all((inner, line)):
//                 raise ValueError('squares have an inner color if and only if they have a line')
//             self.outer = outer
//             self.inner = inner
//             self.line = line

//     DEFAULT = Value()

//     def get_child_values(self):
//         P = 1 if not self.parent else 0 if self.value.outer == biome.OCEAN else 0.5
//         if self.value.line:
//             # endpoints of children's lines must coincide with parent:
//             start = parent_to_child(self.value.line.start)
//             end = parent_to_child(self.value.line.end)
//             inner = self.value.inner
//         elif random.random() < P: # probability of empty square becoming a loop
//             # lines in an empty parent must form a clockwise loop:
//             # only possible loop is through all 4 squares, so we start clockwise from 0:
//             start = Point(0, '_', random.random())
//             end = start.get_neighbor()
//             # i = biome.BIOMES.index(self.value.outer)
//             # inner = biome.BIOMES[max(1, min(len(biome.BIOMES) - 1,
//             #                                 i + random.choice((-1, 1))))]
//             inner = random.choice(biome.BIOMES[1:])
//         else: # half the time
//             # empty children for empty parent:
//             return (self.value,) * 4

//         children = collections.defaultdict(list)
//         def store(p):
//             children[p.child].append(p)
//         store(start)
//         point = start
//         while point.child != end.child:
//             # note that this will definitely reach end,
//             # because there are only two internal sides per square and one will be taken,
//             # so we will not loop back.
//             point = random_endpoint(point.child, taken_side=point.side)
//             store(point)
//             point = point.get_neighbor()
//             store(point)
//         store(end)

//         if len(children) < 4: # some empty children, so figure out which are inside
//             assert self.value.line # this should only happen for a nonempty parent
//             # assemble inside children in clockwise order:
//             inside = [LINES[start.side][0], start.child,
//                       end.child, LINES[end.side][1]]
//             while inside[0] != inside[-1]:
//                 inside.append(ROTATED[inside[-1]])
//             inside = set(inside)

//         values = []
//         for i in xrange(4):
//             if i in children:
//                 values.append(LineSquare.Value(self.value.outer, inner,
//                                                Line(*children[i])))
//             else:
//                 values.append(LineSquare.Value(inner if i in inside else self.value.outer))
//         return tuple(values)

//     def draw(self, surface):
//         if self.value.outer in biome.IMAGES:
//             surface.blit(biome.IMAGES[self.value.outer], (0, 0))
//         else:
//             surface.fill(square.as_color(self.value.outer))

//         if self.value.line:
//             mask = surface.copy()
//             mask.fill((0, 0, 0))
//             w = mask.get_width()
//             h = mask.get_height()
//             corners = [(0, 0), (w, 0),
//                        (0, h), (w, h)]
//             poly = []
//             a,b = LINES[self.value.line.start.side]
//             poly.append(corners[a])
//             start = interpolate(corners[a], corners[b], self.value.line.start.x)
//             poly.append(start)
//             a,b = LINES[self.value.line.end.side]
//             end = interpolate(corners[a], corners[b], self.value.line.end.x)
//             poly.append(end)
//             # close the polygon, clockwise:
//             while poly[0] != poly[-1]:
//                 poly.append(corners[b])
//                 b = ROTATED[b]

//             pygame.draw.polygon(mask, (255, 255, 255), poly)

//             # remove inner from outer:
//             surface.blit(mask, (0, 0), special_flags=pygame.BLEND_SUB)

//             # fill inner with image or color:
//             if self.value.inner in biome.IMAGES:
//                 mask.blit(biome.IMAGES[self.value.inner], (0, 0), special_flags=pygame.BLEND_MULT)
//             else:
//                 mask.fill(square.as_color(self.value.inner), special_flags=pygame.BLEND_MULT)
//             # add inner to outer:
//             surface.blit(mask, (0, 0), special_flags=pygame.BLEND_ADD)
