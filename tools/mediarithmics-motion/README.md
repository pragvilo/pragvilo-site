# mediarithmics · Remotion journey

Three 4-second scenes (720 × 440, 30 fps), integrated with @remotion/player.
Illustrative graphics, not a production product interface. No audio or remote assets.

- `npm ci`
- `npm run dev -- --no-open` opens the editable composition in Remotion Studio.
- `npm run lint` checks types and lint rules.
- `npm run build:player` rebuilds the static site asset from the repository's tools folder.
  An alternative output path can be passed with `npm run build:player -- /absolute/path/journey-player.js`.

The first scene has an SVG fallback in the website. Playback starts once when visible,
pauses offscreen or when a dialog opens, and stays still with reduced motion.
Each step button seeks to a fully composed still. Playback can be explicitly restarted.
The website supplies DM Sans; public/dm-sans.woff2 is only used by Studio.

Remotion dependencies are pinned to 4.0.545. Read Remotion's license before reuse by
another company: https://www.remotion.dev/license
