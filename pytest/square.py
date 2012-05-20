import random

import pygame


def average_ints(avg, lo, hi, n):
    """return a list of n ints between lo and hi which average to avg"""
    # sum(xs) / n = avg, or n*avg - sum(xs) = 0:
    remaining = n * avg
    unassigned = n
    xs = []
    for _ in xrange(n):
        unassigned -= 1
        x = random.randint(max(lo, remaining - unassigned*hi),
                           min(hi, remaining - unassigned*lo))
        remaining -= x
        xs.append(x)
    # we must shuffle to make distribution independent of order:
    random.shuffle(xs)
    return xs

def as_color(c):
    if len(c) == 1:
        return c * 3
    elif len(c) in (3, 4):
        return c
    else:
        raise ValueError('bad color: %s' % c)


class Square(object):
    def __init__(self, value, is_root=True):
        self.value = value
        self.is_root = is_root
        self.children = None

    def get_children(self):
        if not self.children:
            self.children = tuple(self.__class__(v, is_root=False)
                                  for v in self.get_child_values())
        return self.children

    def draw_children(self, surface, d=0):
        if d > 0:
            w = surface.get_width() / 2
            h = surface.get_height() / 2
            children = iter(self.get_children())
            for j in (0, 1):
                for i in (0, 1):
                    children.next().draw_children(surface.subsurface(i * w, j * h, w, h),
                                                  d - 1)
        else:
            self.draw(surface)
            pygame.draw.rect(surface, (128, 128, 128),
                             (0, 0, surface.get_width() + 1, surface.get_height() + 1),
                             1)

class ColorSquare(Square):
    # self.value is a 1-, 3-, or 4-tuple color

    def get_child_values(self):
        channels = [average_ints(v, 0, 255, 4)
                    for v in self.value]
        return zip(*channels)

    def draw(self, surface):
        surface.fill(as_color(self.value))
