# coding=utf-8

import collections
import random

import pygame

import square


_SPLITS = collections.defaultdict(set)
# ways to split 1-squares into 4-squares, excluding rotations which we automatically add:
# (note that trailing spaces are just so that we can use plain backslashes :'( )
_SPLITS.update({u' ': {ur'   '
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
                       }})
# get rid of trailing spaces:
for k,v in _SPLITS.items():
    _SPLITS[k] = {(s[0] + s[1] +
                   s[3] + s[4]) for s in v}

# 90 degree rotations of 1-squares:
_ROTATED = {u' ': u' ',
            u']': u'‾',
            u'‾': u'[',
            u'[': u'_',
            u'_': u']',
            u'/': u'\\',
            u'\\': u'/'}

# 90 degree rotation of a 4-square:
def _rotate(child):
    return (_ROTATED[child[2]] + _ROTATED[child[0]] +
            _ROTATED[child[3]] + _ROTATED[child[1]])

# add all rotated splits:
for parent,children in _SPLITS.items():
    for _ in xrange(3): # 90, 180, and 270 degrees
        parent = _ROTATED[parent]
        children = {_rotate(child) for child in children}
        _SPLITS[parent] |= children


for parent,children in _SPLITS.iteritems():
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


class CornerLineSquare(square.Square):
    # value is one of ' ', '‾', '[', '_', ']', '/', '\'

    def get_child_values(self):
        return random.choice(tuple(_SPLITS[self.v]))

    def draw(self, surface):
        w = surface.get_width() - 2
        h = surface.get_height() - 2
        surface.fill((64, 64, 128))
        pygame.draw.rect(surface, (64,64,64),
                         (1, 1, w, h))
        line = {u' ': None,
                u'‾': ((1, 1), (w, 1)),
                u'[': ((w, 1), (w, h)),
                u'_': ((w, h), (1, h)),
                u']': ((1, h), (1, 1)),
                u'\\': ((1, 1), (w, h)),
                u'/': ((1, h), (w, 1))}[self.v]
        if line:
            pygame.draw.line(surface, (255,255,255),
                             line[0], line[1])


def ifirst(xs):
    for x in xs:
        return x

def _opposite(s):
    return _rotated[_rotated[s]]

_NEIGHBORS = {0: {u'[': 1,
                  u'_': 2},
              1: {u'_': 3},
              2: {u'[': 3}}
print _NEIGHBORS


class LineSquare(square.Square):
    # value is a dict {i: x, j: y} or None
    # where i and j in (']','‾','[','_') specify sides of the square
    # and x and y between 0.0 and 1.0 specify distance along the side


    def parent_to_child(s, x):
        """return (i, t, y) where i in (0,1,2,3) is the child index,
        t in (']','‾','[','_') is the side of the child square,
        and y between 0.0 and 1.0 is distance along child side

        note that t will always equal s THINK ABOUT IT"""

        a,b = {'‾': (0, 1),
               '[': (1, 3),
               '_': (3, 2),
               ']': (2, 0)}[i]
        if x < 0.5:
            return (a, s, 2*x)
        else:
            return (b, s, 2*x - 1)

    def get_child_values(self):
        children = {}
        if self.v:
            start,end = self.v.items()
            child, s, x = parent_to_child(*start)
            children[child] = {s: x}
        else:
            start = end = None
            child = random.randrange(4)
            children[child] = {}
        children = range(4)
        
        return
