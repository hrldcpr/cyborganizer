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


class LineSquare(square.Square):
    # self.value is an instance of Value.
    class Value:
        """inner is the color to the right of line
        and outer is the color of the rest of the square.
        line is None or of the form (start, end)
        where start and end are of the form (side, x)
        where side in (']','‾','[','_') specifies side of the square
        and x between 0.0 and 1.0 specifies distance along the side"""

        def __init__(self, outer, inner=None, line=None):
            self.outer = outer
            self.inner = inner
            self.line = line

    @staticmethod
    def parent_to_child(side, x):
        """return (i, s, y) where i in (0,1,2,3) is the child index,
        s in (']','‾','[','_') is the side of the child square,
        and y between 0.0 and 1.0 is distance along child side

        note that s will always equal side THINK ABOUT IT"""

        a,b = LINES[side]
        if x < 0.5:
            return (a, side, 2*x)
        else:
            return (b, side, 2*x - 1)

    @staticmethod
    def random_endpoint(child, taken_side=None):
        """return ((child, s, x), (i, t, y)), with s != taken_side,
        which are a random endpoint in the current child
        and the corresponding endpoint in the child's neighbor"""
        sides = [s for s in SIDES[child] if s != taken_side]
        a = (child, random.choice(sides), random.random())
        b = (SIDES[a[0]][a[1]], opposite(a[1]), 1 - a[2])
        return a,b

    def get_child_values(self):
        if self.value.line:
            # endpoints of children's lines must coincide with parent:
            start,end = self.value.line
            start = LineSquare.parent_to_child(*start)
            end = LineSquare.parent_to_child(*end)
        elif random.random() < 0.5: # half the time
            # lines in an empty parent must be internal and form a loop:
            start,end = LineSquare.random_endpoint(random.randrange(4))
        else: # half the time
            # empty children for empty parent:
            return (self.value,) * 4

        children = collections.defaultdict(list)
        def store(child, side, x):
            children[child].append((side, x))
        store(*start)
        child = start[0]
        while child != end[0]:
            # note that this will definitely reach end,
            # because there are only two internal sides per square and one will be taken,
            # so we will not loop back.
            this_end,next_start = LineSquare.random_endpoint(child, taken_side=children[child][0][0])
            store(*this_end)
            store(*next_start)
            child = next_start[0]
        store(*end)

        inner = self.value.inner
        outer = self.value.outer
        return tuple(LineSquare.Value(inner, outer, children.get(i))
                     for i in xrange(4))

    def draw(self, surface):
        w = surface.get_width() - 2
        h = surface.get_height() - 2
        surface.fill((64, 64, 128))
        pygame.draw.rect(surface, (64,64,64),
                         (1, 1, w, h))
        if self.value.line:
            start,end = self.value.line
            corners = [(1, 1), (w, 1),
                       (1, h), (w, h)]
            line = LINES[start[0]]
            start = interpolate(corners[line[0]], corners[line[1]], start[1])
            line = LINES[end[0]]
            end = interpolate(corners[line[0]], corners[line[1]], end[1])
            pygame.draw.line(surface, (255,255,255), start, end)
