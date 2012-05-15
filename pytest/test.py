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

        elif (event.type == pygame.KEYUP
              and event.key == ord(' ')):
            d += 1
            root.draw_children(screen, d)
            pygame.display.flip()
