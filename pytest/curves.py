import collections
import random

import pygame

import square


_splits = collections.defaultdict(set)
_splits.update({' ': {'  '
                      '  ',
                      'J<'
                      '^ ',
                      'JL'
                      '^^',
                      'JL'
                      'LJ'},
                '<': {'< '
                      '< ',
                      'L '
                      'J ',
                      '^L'
                      'vJ'},
                'J': {' J'
                      'J ',
                      'J^'
                      '< '}})
_rotated = {' ': ' ',
            '<': '^',
            '^': '>',
            '>': 'v',
            'v': '<',
            'J': 'L',
            'L': 'J'}

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
        return list(random.choice(tuple(_splits[self.v])))

    def draw(self, surface):
        w = surface.get_width()
        h = surface.get_height()
        line = {' ': None,
                '^': ((0, 0), (w, 0)),
                '>': ((w, 0), (w, h)),
                'v': ((w, h), (0, h)),
                '<': ((0, h), (0, 0)),
                'L': ((0, 0), (w, h)),
                'J': ((w, h), (0, 0))}[self.v]
        if line:
            pygame.draw.line(surface, (255,255,255),
                             line[0], line[1])
