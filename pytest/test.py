import sys

import pygame

import square
import curve


size = width, height = 640, 640


pygame.init()
screen = pygame.display.set_mode(size)

root = curve.LineSquare(curve.LineSquare.Value())
#root = curve.CornerLineSquare(curve.CornerLineSquare.Value())

d = 6
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

        elif event.type == pygame.MOUSEBUTTONUP and event.button == 1:
            x,y = event.pos
            i = 2 * x / width
            j = 2 * y / height
            root = root.get_children()[2*j + i]

        if not (d0 == d and root0 == root):
            print 'detail=%d' % d
            root.draw_children(screen, d)
            pygame.display.flip()
