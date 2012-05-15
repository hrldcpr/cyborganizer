import random


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


class Square(object):
    def __init__(self, x, y, z, v):
        self.x = x
        self.y = y
        self.z = z
        self.v = v
        self.children = None

    def get_children(self):
        if not self.children:
            values = self.get_child_values()
            self.children = tuple(self.__class__(2*self.x + i, 2*self.y + j,
                                                 self.z + 1, values.pop())
                                  for j in (0, 1) for i in (0, 1))
        return self.children

    def draw_children(self, screen, d=0):
        if d > 0:
            for child in self.get_children():
                child.draw_children(screen, d - 1)
        else:
            w = screen.get_width()
            h = screen.get_height()
            k = 1 << self.z
            self.draw(screen.subsurface(self.x * w / k,
                                        self.y * h / k,
                                        w / k, h / k))

class ColorSquare(Square):
    def get_child_values(self):
        channels = [average_ints(v, 0, 255, 4)
                    for v in self.v]
        return zip(*channels)

    def draw(self, surface):
        if len(self.v) == 1: # grayscale
            surface.fill(self.v * 3)
        else: # RGB or RGBA
            surface.fill(self.v)
