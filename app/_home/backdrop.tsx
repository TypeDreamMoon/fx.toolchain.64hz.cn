/**
 * The deck's backdrop: three soft lights that drift on their own and re-place
 * themselves when the screen changes.
 *
 * It is fixed behind everything and purely decorative, so it stays server-side
 * markup — the movement is CSS, and the per-screen placement keys off
 * `documentElement[data-screen]`, which `SlideDeck` sets. The bands' own washes
 * sit on top of it and are translucent, so the light reads through them.
 */
export function Backdrop() {
  return (
    <div aria-hidden="true" className="dfx-backdrop">
      <span className="dfx-glow dfx-glow-a" />
      <span className="dfx-glow dfx-glow-b" />
      <span className="dfx-glow dfx-glow-c" />
      <span className="dfx-weave" />
    </div>
  );
}
