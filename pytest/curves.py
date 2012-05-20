# coding=utf-8
from __future__ import unicode_literals

import collections
import random

import pygame

import square


# 90 degree rotations:
ROTATED = {' ': ' ',
           ']': '‾',
           '‾': '[',
           '[': '_',
           '_': ']',
           '/': '\\',
           '\\': '/',
           0: 1,
           1: 3,
           3: 2,
           2: 0}
UNROTATED = {ROTATED[k]: k
             for k in ROTATED}

def opposite(s):
    return ROTATED[ROTATED[s]]

# 90 degree rotation of a 4-square:
def rotate(child):
    return ''.join(ROTATED[child[UNROTATED[i]]]
                   for i in xrange(4))

# lines on a 1-square in terms of 4-squares:
LINES = {' ': None,
         '‾': (0, 1),
         '/': (2, 1)}
# add rotations:
for side,line in LINES.items():
    if line:
        for _ in xrange(3): #90, 180, and 270 degrees
            side = ROTATED[side]
            line = (ROTATED[line[0]], ROTATED[line[1]])
            LINES[side] = line

# 4-square neighbors via sides:
# e.g. NEIGHBORS[0][1] == '[' and SIDES[0]['['] == 1
NEIGHBORS = collections.defaultdict(dict)
SIDES = collections.defaultdict(dict)
for side,line in LINES.iteritems():
    if side in (']','‾','[','_'):
        a,b = line
        side = ROTATED[side]
        NEIGHBORS[a][b] = side
        SIDES[a][side] = b
        NEIGHBORS[b][a] = opposite(side)
        SIDES[b][opposite(side)] = a
# avoid subtle defaultdict bugs:
NEIGHBORS = dict(NEIGHBORS)
SIDES = dict(SIDES)

# ways to split 1-squares into 4-squares, excluding rotations which we automatically add:
# (note that trailing spaces are just so that we can use plain backslashes :'( )
SPLITS = {' ': {r'   '
                r'   ',

                r'/] '
                r'‾  ',

                r'/\ '
                r'‾‾ ',

                r'/\ '
                r'\/ '},

          ']': {r']  '
                r']  ',

                r'\  '
                r'/  ',

                # r'‾\ '
                # r'_/ ',
                },

          '/': {r' / '
                r'/  ',

                r'/‾ '
                r']  ',
                }}
# get rid of trailing spaces:
for k,v in SPLITS.items():
    SPLITS[k] = {(s[0] + s[1] +
                  s[3] + s[4]) for s in v}
# add all rotated splits:
d = collections.defaultdict(set)
d.update(SPLITS)
SPLITS = d
for parent,children in SPLITS.items():
    for _ in xrange(3): # 90, 180, and 270 degrees
        parent = ROTATED[parent]
        children = {rotate(child) for child in children}
        SPLITS[parent] |= children
# avoid subtle defaultdict bugs:
SPLITS = dict(SPLITS)

for parent,children in SPLITS.iteritems():
    print ' _ ', '  ',
    for child in children:
        print ' __ ',
    print

    print '|' + parent + '|', '=>',
    for child in children:
        print '|' + child[:2] + '|',
    print

    print ' ‾ ', '  ',
    for child in children:
        print '|' + child[2:] + '|',
    print

    print '   ', '  ',
    for child in children:
        print ' ‾‾ ',
    print


def ifirst(xs):
    for x in xs:
        return x

def interpolate(p, q, x):
    return tuple((1 - x)*a + x*b
                 for a,b in zip(p, q))


class CornerLineSquare(square.Square):
    class Value:
        """inner is the color to the right of line
        and outer is the color of the rest of the square.
        line is one of ' ', '‾', '[', '_', ']', '/', '\\'"""
        def __init__(self, outer, inner=None, line=' '):
            if (line == ' ' and inner) or not (line == ' ' or inner):
                raise ValueError('squares have an inner color if and only if they have a line')
            self.outer = outer
            self.inner = inner
            self.line = line

    def get_child_values(self):
        values = random.choice(tuple(SPLITS[self.value.line]))
        inner = (random.random(), random.random(), random.random())
        return tuple(CornerLineSquare.Value(self.value.outer, None if v == ' ' else inner, v)
                     for v in values)

    def draw(self, surface):
        w = surface.get_width() - 2
        h = surface.get_height() - 2
        surface.fill((64, 64, 128))
        pygame.draw.rect(surface, (64,64,64),
                         (1, 1, w, h))
        line = LINES[self.value.line]
        if line:
            corners = [(1, 1), (w, 1),
                       (1, h), (w, h)]
            pygame.draw.line(surface, (255,255,255),
                             corners[line[0]], corners[line[1]])


class Point:
    """child in (0, 1, 2, 3) specifies the child id,
    side in (']', '‾', '[', '_') specifies side of the square
    and x between 0.0 and 1.0 specifies distance along the side"""
    def __init__(self, child, side, x):
        if child not in (0, 1, 2, 3):
            raise ValueError('invalid child id: %s' % child)
        if side not in (']', '‾', '[', '_'):
            raise ValueError('side=%s not a valid side' % side)
        if x < 0 or x >= 1:
            raise ValueError('x=%s not in [0, 1)' % x)
        self.child = child
        self.side = side
        self.x = x

    def get_neighbor(self):
        return Point(SIDES[self.child][self.side], opposite(self.side), 1 - self.x)

class Line:
    def __init__(self, start, end):
        if not (isinstance(start, Point) and isinstance(end, Point)):
            raise ValueError('start=%s and end=%s are not both Points' % (start, end))
        self.start = start
        self.end = end

def parent_to_child(p):
    """return the child point q corresponding to p in the parent.
    note that q.side == p.side THINK ABOUT IT"""

    a,b = LINES[p.side]
    if p.x < 0.5:
        return Point(a, p.side, 2*p.x)
    else:
        return Point(b, p.side, 2*p.x - 1)

def random_endpoint(child, taken_side=None):
    """return a random endpoint in the current child not on taken_side"""
    sides = [s for s in SIDES[child] if s != taken_side]
    return Point(child, random.choice(sides), random.random())

class LineSquare(square.Square):
    class Value:
        """inner is the color to the right of line
        and outer is the color of the rest of the square"""
        def __init__(self, outer, inner=None, line=None):
            if any((inner, line)) and not all((inner, line)):
                raise ValueError('squares have an inner color if and only if they have a line')
            self.outer = outer
            self.inner = inner
            self.line = line

    def get_child_values(self):
        if self.value.line:
            # endpoints of children's lines must coincide with parent:
            start = parent_to_child(self.value.line.start)
            end = parent_to_child(self.value.line.end)
            inner = self.value.inner
        elif random.random() < 0.5: # half the time
            # lines in an empty parent must form a clockwise loop:
            # only possible loop is through all 4 squares, so we start clockwise from 0:
            start = Point(0, '_', random.random())
            end = start.get_neighbor()
            inner = tuple(max(0, min(255, v + random.randint(-32, 32)))
                          for v in self.value.outer)
        else: # half the time
            # empty children for empty parent:
            return (self.value,) * 4

        children = collections.defaultdict(list)
        def store(p):
            children[p.child].append(p)
        store(start)
        point = start
        while point.child != end.child:
            # note that this will definitely reach end,
            # because there are only two internal sides per square and one will be taken,
            # so we will not loop back.
            point = random_endpoint(point.child, taken_side=point.side)
            store(point)
            point = point.get_neighbor()
            store(point)
        store(end)

        if len(children) < 4: # some empty children, so figure out which are inside
            assert self.value.line # this should only happen for a nonempty parent
            # assemble inside children in clockwise order:
            inside = [LINES[start.side][0], start.child,
                      end.child, LINES[end.side][1]]
            while inside[0] != inside[-1]:
                inside.append(ROTATED[inside[-1]])
            inside = set(inside)

        values = []
        for i in xrange(4):
            if i in children:
                values.append(LineSquare.Value(self.value.outer, inner,
                                               Line(*children[i])))
            else:
                values.append(LineSquare.Value(inner if i in inside else self.value.outer))
        return tuple(values)

    def draw(self, surface):
        surface.fill(square.as_color(self.value.outer))

        if self.value.line:
            w = surface.get_width() - 1
            h = surface.get_height() - 1
            corners = [(0, 0), (w, 0),
                       (0, h), (w, h)]
            poly = []
            a,b = LINES[self.value.line.start.side]
            poly.append(corners[a])
            start = interpolate(corners[a], corners[b], self.value.line.start.x)
            poly.append(start)
            a,b = LINES[self.value.line.end.side]
            end = interpolate(corners[a], corners[b], self.value.line.end.x)
            poly.append(end)
            # close the polygon, clockwise:
            while poly[0] != poly[-1]:
                poly.append(corners[b])
                b = ROTATED[b]

            pygame.draw.polygon(surface, square.as_color(self.value.inner), poly)
