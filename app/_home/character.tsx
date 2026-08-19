/**
 * The DreamFX mascot, as the hero's art column.
 *
 * The source PNG (`Plugins/DreamFX/Images/character.png`) carries an alpha channel
 * around the figure only — the blue backdrop and the obelisk beside her live in the
 * RGB of transparent pixels, so a cutout is what the file actually offers. That suits
 * the page better anyway: the halo and the floor glow below are ours, so she sits in
 * the site's own light rather than in the render's.
 *
 * `scripts/prepare-art.py` writes the two WebP widths this points at.
 */
export function Character({ alt, caption }: { alt: string; caption: string }) {
  return (
    <div className="dfx-art">
      <div className="dfx-art-stage">
        <span className="dfx-art-halo" aria-hidden="true" />
        <span className="dfx-art-ring" aria-hidden="true" />

        <img
          alt={alt}
          className="dfx-art-figure"
          decoding="async"
          fetchPriority="high"
          height={1419}
          sizes="(max-width: 960px) 62vw, 34vw"
          src="/art/character-960.webp"
          srcSet="/art/character-480.webp 480w, /art/character-960.webp 960w"
          width={795}
        />

        <span className="dfx-art-plinth" aria-hidden="true" />
      </div>

      <p className="dfx-art-plaque">{caption}</p>
    </div>
  );
}
