# coding=utf-8

import collections
import random

import pygame

import square


# 90 degree rotations:
ROTATED = {u' ': u' ',
           u']': u'‾',
           u'‾': u'[',
           u'[': u'_',
           u'_': u']',
           u'/': u'\\',
           u'\\': u'/',
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
LINES = {u' ': None,
         u'‾': (0, 1),
         u'/': (2, 1)}
# add rotations:
for side,line in LINES.items():
    if line:
        for _ in xrange(3): #90, 180, and 270 degrees
            side = ROTATED[side]
            line = (ROTATED[line[0]], ROTATED[line[1]])
            LINES[side] = line

# 4-square neighbors via sides:
# e.g. NEIGHBORS[0][1] == '[' and NEIGHBORS[0]['['] == 1
NEIGHBORS = collections.defaultdict(dict)
for side,line in LINES.iteritems():
    if line:
        a,b = line
        side = ROTATED[side]
        NEIGHBORS[a][b] = side
        NEIGHBORS[a][side] = b
        NEIGHBORS[b][a] = opposite(side)
        NEIGHBORS[b][opposite(side)] = a

# ways to split 1-squares into 4-squares, excluding rotations which we automatically add:
# (note that trailing spaces are just so that we can use plain backslashes :'( )
SPLITS = {u' ': {ur'   '
                 ur'   ',

                 ur'/] '
                 ur'‾  ',

                 ur'/\ '
                 ur'‾‾ ',

                 ur'/\ '
                 ur'\/ '},

          u']': {ur']  '
                 ur']  ',

                 ur'\  '
                 ur'/  ',

                 # ur'‾\ '
                 # ur'_/ ',
                 },

          u'/': {ur' / '
                 ur'/  ',

                 ur'/‾ '
                 ur']  ',
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


class CornerLineSquare(square.Square):
    # value is one of ' ', '‾', '[', '_', ']', '/', '\'

    def get_child_values(self):
        return random.choice(tuple(SPLITS[self.v]))

    def draw(self, surface):
        w = surface.get_width() - 2
        h = surface.get_height() - 2
        surface.fill((64, 64, 128))
        pygame.draw.rect(surface, (64,64,64),
                         (1, 1, w, h))
        line = LINES[self.v]
        if line:
            corners = [(1, 1), (w, 1),
                       (1, h), (w, h)]
            pygame.draw.line(surface, (255,255,255),
                             corners[line[0]], corners[line[1]])


class LineSquare(square.Square):
    # value is a dict {s: x, t: y} or None
    # where s and t in (']','‾','[','_') specify sides of the square
    # and x and y between 0.0 and 1.0 specify distance along the side


    def parent_to_child(s, x):
        """return (i, t, y) where i in (0,1,2,3) is the child index,
        t in (']','‾','[','_') is the side of the child square,
        and y between 0.0 and 1.0 is distance along child side

        note that t will always equal s THINK ABOUT IT"""

        a,b = LINES[s]
        if x < 0.5:
            return (a, s, 2*x)
        else:
            return (b, s, 2*x - 1)

    def get_child_values(self):
        print self.v
        children = collections.defaultdict(dict)
        if self.v:
            # endpoints of children's lines must coincide with parent:
            start,end = self.v.items()
            start = parent_to_child(*start)
            end = parent_to_child(*end)
        elif random.random() < 0.5: # half the time
            # lines in an empty parent must be internal and form a loop:
            start = random.randrange(4)
            start = (start,
                     random.choice(s for s in NEIGHBORS[start]
                                   if isinstance(s, unicode)),
                     random.random())
            # end at the same point, but in the neighboring child:
            end = (NEIGHBORS[start[0]][start[1]],
                   opposite(start[1])
                   1 - start[2])
        else: # half the time
            # empty children for empty parent:
            return (None,) * 4

        children[start[0]][start[1]] = start[2]
        children[end[0]][end[1]] = end[2]
        return

    def draw(self, surface):
        return
