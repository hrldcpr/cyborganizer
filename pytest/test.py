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
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            sys.exit()

        elif event.type == pygame.KEYUP:
            if event.key == ord('-'):
                d = max(0, d - 1)
            elif event.key == ord('='):
                d = d + 1

        print 'detail=%d' % d
        root.draw_children(screen, d)
        pygame.display.flip()
