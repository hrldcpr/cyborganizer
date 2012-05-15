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
        return random.choice(tuple(_splits[self.v]))

    def draw(self, surface):
        w = surface.get_width() - 2
        h = surface.get_height() - 2
        surface.fill((0, 0, 128))
        pygame.draw.rect(surface, (0,0,0),
                         (1, 1, w, h))
        line = {' ': None,
                '^': ((1, 1), (w, 1)),
                '>': ((w, 1), (w, h)),
                'v': ((w, h), (1, h)),
                '<': ((1, h), (1, 1)),
                'L': ((1, 1), (w, h)),
                'J': ((1, h), (w, 1))}[self.v]
        if line:
            pygame.draw.line(surface, (255,255,255),
                             line[0], line[1])
