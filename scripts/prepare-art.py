"""Prepare the homepage art from the plugin's own images.

`Plugins/DreamFX/Images/character.png` is a 2.6 MB RGBA source with a lot of empty
margin. This crops it to the alpha bounding box and writes two WebP widths for the
hero's `srcset`.

The resize happens on **premultiplied** colour. The source's transparent pixels still
carry the generator's blue, and a plain RGBA downscale averages that blue into the
edge pixels — the classic halo. Premultiplying, scaling, then un-premultiplying keeps
the silhouette clean, and the transparent margin is re-bled with the nearest opaque
colour first, so a browser's own scaling cannot reintroduce one either.

    python scripts/prepare-art.py --plugin <path to Plugins/DreamFX>
"""

import argparse
import os

import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
DEFAULT_PLUGIN = r"I:\UnrealProject_Moon\DEV_58\DevTest\Plugins\DreamFX"
OUT = os.path.join(SITE, "public", "art")

WIDTHS = [480, 960]
QUALITY = 78


def premultiplied_resize(image, size):
    """Downscale RGBA without letting transparent colour bleed into the silhouette."""
    data = np.asarray(image, dtype=np.float32)
    alpha = data[..., 3:4] / 255.0

    premultiplied = np.concatenate([data[..., :3] * alpha, data[..., 3:4]], axis=-1)
    scaled = np.asarray(
        Image.fromarray(np.clip(premultiplied, 0, 255).astype(np.uint8), "RGBA").resize(
            size, Image.LANCZOS
        ),
        dtype=np.float32,
    )

    scaled_alpha = np.maximum(scaled[..., 3:4] / 255.0, 1e-4)
    colour = np.clip(scaled[..., :3] / scaled_alpha, 0, 255)

    out = np.concatenate([colour, scaled[..., 3:4]], axis=-1)
    return Image.fromarray(out.astype(np.uint8), "RGBA")


def bleed_edges(image, passes=6):
    """Push opaque colour outward into the transparent margin."""
    r, g, b, a = image.split()
    colour = Image.merge("RGB", (r, g, b))
    mask = a.point(lambda v: 255 if v > 8 else 0)

    for _ in range(passes):
        blurred = colour.filter(ImageFilter.GaussianBlur(2))
        colour = Image.composite(colour, blurred, mask)
        mask = mask.filter(ImageFilter.MaxFilter(5))

    return Image.merge("RGBA", (*colour.split(), a))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--plugin", default=os.environ.get("DREAMFX_PLUGIN", DEFAULT_PLUGIN)
    )
    args = parser.parse_args()

    source = os.path.join(args.plugin, "Images", "character.png")
    if not os.path.exists(source):
        raise SystemExit("no character.png under %s" % args.plugin)

    os.makedirs(OUT, exist_ok=True)

    image = Image.open(source).convert("RGBA")

    # The generator leaves alpha 1-2 across the background rather than 0, so a plain
    # getbbox() finds no margin at all. Floor the near-transparent tail first: it also
    # keeps a faint ghost of the source's blue out of the exported file.
    alpha = image.getchannel("A").point(lambda v: 0 if v <= 6 else v)
    image.putalpha(alpha)

    box = alpha.getbbox()
    image = image.crop(box)
    print("cropped to %dx%d from %s" % (image.size[0], image.size[1], box))

    image = bleed_edges(image)

    for width in WIDTHS:
        height = round(image.size[1] * width / image.size[0])
        resized = premultiplied_resize(image, (width, height))
        path = os.path.join(OUT, "character-%d.webp" % width)
        resized.save(path, "WEBP", quality=QUALITY, method=6)
        print(
            "%s  %dx%d  %.0f KB"
            % (os.path.basename(path), width, height, os.path.getsize(path) / 1024)
        )


if __name__ == "__main__":
    main()
