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
    # value is one of ' ', '‾', '[', '_', ']', '/', '\'

    def get_child_values(self):
        return random.choice(tuple(SPLITS[self.value]))

    def draw(self, surface):
        w = surface.get_width() - 2
        h = surface.get_height() - 2
        surface.fill((64, 64, 128))
        pygame.draw.rect(surface, (64,64,64),
                         (1, 1, w, h))
        line = LINES[self.value]
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
            raise ValueError('x=%s not in [0,1)' % x)
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
    # self.value is an instance of Value.
    class Value:
        """inner is the color to the right of line
        and outer is the color of the rest of the square"""
        def __init__(self, outer, inner=None, line=None):
            self.outer = outer
            self.inner = inner
            self.line = line

    def get_child_values(self):
        if self.value.line:
            # endpoints of children's lines must coincide with parent:
            start = parent_to_child(self.value.line.start)
            end = parent_to_child(self.value.line.end)
        elif random.random() < 0.5: # half the time
            # lines in an empty parent must form a clockwise loop:
            start = random.randrange(4)
            # don't go counterclockwise, i.e. don't go through the side leading to UNROTATED[start]:
            start = random_endpoint(start, taken_side=NEIGHBORS[start][UNROTATED[start]])
            end = start.get_neighbor()
        else: # half the time
            # empty children for empty parent:
            return (self.value,) * 4

        children = collections.defaultdict(list)
        def store(p):
            children[p.child].append(p)
        store(start)
        store(end)
        point = start
        while point.child != end.child:
            # note that this will definitely reach end,
            # because there are only two internal sides per square and one will be taken,
            # so we will not loop back.
            point = random_endpoint(point.child, taken_side=point.side)
            store(point)
            point = point.get_neighbor()
            store(point)

        inner = self.value.inner
        return tuple(LineSquare.Value(self.value.outer, inner,
                                      (Line(*children[i]) if i in children else None))
                     for i in xrange(4))

    def draw(self, surface):
        w = surface.get_width() - 2
        h = surface.get_height() - 2
        surface.fill((64, 64, 128))
        pygame.draw.rect(surface, (64,64,64),
                         (1, 1, w, h))
        if self.value.line:
            corners = [(1, 1), (w, 1),
                       (1, h), (w, h)]
            a,b = LINES[self.value.line.start.side]
            start = interpolate(corners[a], corners[b], self.value.line.start.x)
            a,b = LINES[self.value.line.end.side]
            end = interpolate(corners[a], corners[b], self.value.line.end.x)
            pygame.draw.line(surface, (255,255,255), start, end)
            pygame.draw.circle(surface, (0,255,0), map(int, start), 2)
            pygame.draw.circle(surface, (255,0,0), map(int, end), 2)
