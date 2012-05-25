import pygame

OCEAN = (0, 64, 64)
BEACH = (192, 192, 0)
JUNGLE = (0, 96, 32)
FIELD = (192, 255, 0)
FOREST = (0, 128, 0)
LAKE = (0, 128, 128)
MOUNTAIN = (64, 64, 64)
SNOW = (224, 224, 255)

BIOMES = [OCEAN, MOUNTAIN, SNOW]

IMAGES = {OCEAN: pygame.image.load('images/water.1.small.png'),
          MOUNTAIN: pygame.image.load('images/mountain.1.small.png'),
          SNOW: pygame.image.load('images/snow.1.small.png'),
          }
