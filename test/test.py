import sys
import random
import pygame

size = width, height = 640, 640


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
            channels = [average_ints(v, 0, 255, 4)
                        for v in self.v]
            children = zip(*channels)
            self.children = tuple(Square(2*self.x + i, 2*self.y + j, self.z + 1,
                                         children.pop())
                                  for i in (0, 1) for j in (0, 1))
        return self.children

    def draw(self, screen, d=0):
        if d > 0:
            for child in self.get_children():
                child.draw(screen, d - 1)
        else:
            k = 1 << self.z
            screen.fill(self.v,
                        (self.x * width / k,
                         self.y * height / k,
                         width / k,
                         height / k))


pygame.init()
screen = pygame.display.set_mode(size)

root = Square(0, 0, 0, (128, 128, 128))
root.draw(screen)
pygame.display.flip()

d = 0
while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            sys.exit()

        elif (event.type == pygame.KEYUP
              and event.key == ord(' ')):
            d += 1
            root.draw(screen, d)
            pygame.display.flip()
