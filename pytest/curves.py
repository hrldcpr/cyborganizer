# coding=utf-8

import collections
import random

import pygame

import square


_splits = collections.defaultdict(set)
_splits.update({u' ': {ur'   '
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
                       ur'‾\ '
                       ur'_/ '
                       },
                u'/': {ur' / '
                       ur'/  ',
                       ur'/‾ '
                       ur']  '}})
# get rid of extra spaces, which were solely so that we could type backslashes in the clear :'(
for k,v in _splits.items():
    _splits[k] = {(s[0] + s[1] +
                   s[3] + s[4]) for s in v}

_rotated = {u' ': u' ',
            u']': u'‾',
            u'‾': u'[',
            u'[': u'_',
            u'_': u']',
            u'/': u'\\',
            u'\\': u'/'}

print _rotated

def _rotate(child):
    return (_rotated[child[2]] + _rotated[child[0]] +
            _rotated[child[3]] + _rotated[child[1]])

for parent,children in _splits.items():
    for _ in xrange(3): # 90, 180, and 270 degrees
        parent = _rotated[parent]
        children = {_rotate(child) for child in children}
        _splits[parent] |= children

for parent,children in _splits.iteritems():
    print '%s (%d)' % (parent, len(children))
    for child in children:
        print '|', child[:2]
        print '|', child[2:]
    print


class CurveSquare(square.Square):
    def get_child_values(self):
        return random.choice(tuple(_splits[self.v]))

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
