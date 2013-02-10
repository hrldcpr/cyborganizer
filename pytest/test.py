import sys

import pygame

import biome
import curve
import square


size = width, height = 640, 640


pygame.init()
screen = pygame.display.set_mode(size)

root = curve.LineSquare()
#root = curve.CornerLineSquare()

# TODO #1 mouse-centered zoom
#      can involve any neighbor, so need to draw from 2 levels higher but viewport will only intersect with some of it
# TODO #2 non-integer zoom
#      round up and draw at that level, then scale. keeping resolution from "jumping" seems quite tricky...


def zoom_out(x, y):
    global root
    if root.parent:
        root = root.parent

def zoom_in(x, y):
    global root
    i = 2 * x / width
    j = 2 * y / height
    root = root.get_children()[2*j + i]

def update_detail():
    print 'detail=%d' % d
    k = 1 << d
    assert width % k == 0 and height % k == 0, "width=%d and height=%d must be divisible by %d" % (width, height, k)
    biome.scale_images(width / k, height / k)

z = 0
d = 5
update_detail()
root.draw_children(screen, d)
pygame.display.flip()

while True:
    for event in pygame.event.get():
        d0, root0 = d, root

        if event.type == pygame.QUIT:
            print 'QUIT'
            sys.exit()

        elif event.type == pygame.KEYUP:
            if event.key == ord('-'):
                if d > 0: d -= 1
            elif event.key == ord('='):
                d += 1
            if d != d0:
                update_detail()

        elif event.type == pygame.MOUSEBUTTONUP and event.button == 1:
            zoom_in(*event.pos)

        elif event.type == pygame.MOUSEBUTTONDOWN:
            if event.button == 5:
                z -= 1
                if z < 0:
                    z += 4
                    zoom_out(*event.pos)
            elif event.button == 4:
                z += 1
                if z > 4:
                    z -= 4
                    zoom_in(*event.pos)

        if d != d0 or root != root0:
            root.draw_children(screen, d)
            pygame.display.flip()
