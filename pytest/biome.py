import pygame

OCEAN = (0, 64, 64)
BEACH = (192, 192, 0)
JUNGLE = (0, 96, 32)
FIELD = (192, 255, 0)
FOREST = (0, 128, 0)
LAKE = (0, 128, 128)
MOUNTAIN = (64, 64, 64)
SNOW = (224, 224, 255)
DESERT = (192, 192, 0)

BIOMES = [OCEAN, MOUNTAIN, SNOW, JUNGLE, DESERT]

_IMAGES = {OCEAN: pygame.image.load('images/water.1.medium.png'),
           MOUNTAIN: pygame.image.load('images/mountain.1.medium.png'),
           SNOW: pygame.image.load('images/snow.1.medium.png'),
           JUNGLE: pygame.image.load('images/jungle.1.medium.png'),
           DESERT: pygame.image.load('images/desert.2.medium.png'),
           }

IMAGES = {}
def scale_images(width, height):
    print 'images=%dpx x %dpx' % (width, height)
    for biome,large in _IMAGES.iteritems():
        scaled = large.copy().subsurface(0, 0, width, height) # wasteful but keeps same color modes...
        pygame.transform.scale(large, (width, height), scaled)
        IMAGES[biome] = scaled
