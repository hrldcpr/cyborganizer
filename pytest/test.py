import sys

import pygame

import square
import curve


size = width, height = 640, 640


pygame.init()
screen = pygame.display.set_mode(size)

root = curve.LineSquare(curve.LineSquare.Value())
#root = curve.CornerLineSquare(curve.CornerLineSquare.Value())

z = 0
d = 5
root.draw_children(screen, d)
pygame.display.flip()

def zoom_in(x, y):
    global root
    if root.parent:
        root = root.parent

def zoom_out(x, y):
    global root
    i = 2 * x / width
    j = 2 * y / height
    root = root.get_children()[2*j + i]

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
            if d != d0: print 'detail=%d' % d

        elif event.type == pygame.MOUSEBUTTONUP and event.button == 1:
            zoom_out(*event.pos)

        elif event.type == pygame.MOUSEBUTTONDOWN:
            if event.button == 5:
                z -= 1
                if z < 0:
                    z += 4
                    zoom_in(*event.pos)
            elif event.button == 4:
                z += 1
                if z > 4:
                    z -= 4
                    zoom_out(*event.pos)

        if d != d0 or root != root0:
            root.draw_children(screen, d)
            pygame.display.flip()
