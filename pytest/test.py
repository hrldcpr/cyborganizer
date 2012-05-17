import sys

import pygame

import square
import curves


size = width, height = 640, 640


pygame.init()
screen = pygame.display.set_mode(size)

root = curves.CornerLineSquare(0, 0, 0, ' ')
root.draw(screen)
pygame.display.flip()

d = 0
while True:
    for event in pygame.event.get([pygame.QUIT, pygame.KEYUP, pygame.MOUSEBUTTONUP]):
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

        print 'detail=%d' % d
        root.draw_children(screen, d)
        pygame.display.flip()
