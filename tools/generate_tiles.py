#!/usr/bin/env python3
"""
UO Map Tile Generator
Generates map tiles from a large UO map image for use with Leaflet.

Usage:
    python3 generate_tiles.py <input_image> [output_dir] [tile_size]

Examples:
    python3 generate_tiles.py ../images/map_trammel.png ../tiles/trammel
    python3 generate_tiles.py map.png ../tiles/felucca 256

Requirements:
    pip install Pillow
"""

import sys
import os
import math
from PIL import Image


def generate_tiles(image_path, output_dir, tile_size=256):
    print(f"Loading image: {image_path}")
    img = Image.open(image_path).convert('RGBA')
    width, height = img.size
    print(f"Image size: {width} x {height}")

    max_dim = max(width, height)
    max_zoom = math.ceil(math.log2(max_dim / tile_size))
    min_zoom = max(0, max_zoom - 4)

    print(f"Generating zoom levels {min_zoom} to {max_zoom}")
    print(f"Tile size: {tile_size}px")

    total_tiles = 0

    for zoom in range(min_zoom, max_zoom + 1):
        scale = 2 ** (zoom - max_zoom)
        scaled_w = max(1, int(width * scale))
        scaled_h = max(1, int(height * scale))

        print(f"  Zoom {zoom}: {scaled_w}x{scaled_h} ", end="", flush=True)

        scaled_img = img.resize((scaled_w, scaled_h), Image.LANCZOS)

        cols = math.ceil(scaled_w / tile_size)
        rows = math.ceil(scaled_h / tile_size)

        zoom_dir = os.path.join(output_dir, str(zoom))

        for x in range(cols):
            col_dir = os.path.join(zoom_dir, str(x))
            os.makedirs(col_dir, exist_ok=True)

            for y in range(rows):
                left = x * tile_size
                upper = y * tile_size
                right = min(left + tile_size, scaled_w)
                lower = min(upper + tile_size, scaled_h)

                tile = Image.new('RGBA', (tile_size, tile_size), (0, 0, 0, 0))
                crop = scaled_img.crop((left, upper, right, lower))
                tile.paste(crop, (0, 0))
                tile.save(os.path.join(col_dir, f'{y}.png'), optimize=True)
                total_tiles += 1

        print(f"({cols}x{rows} = {cols * rows} tiles)")

    print(f"\nDone! Generated {total_tiles} tiles in {output_dir}")
    print(f"Zoom range: {min_zoom}-{max_zoom}")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    image_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else './tiles'
    tile_size = int(sys.argv[3]) if len(sys.argv) > 3 else 256

    if not os.path.exists(image_path):
        print(f"Error: File not found: {image_path}")
        sys.exit(1)

    generate_tiles(image_path, output_dir, tile_size)
