# mediarithmics · automatic Remotion illustrations

Editable compositions: CustomerJourney, IdentityLoop, AudienceWalkthrough,
RetailJourney and BrandArtwork. DM Sans and the existing mediarithmics palette.
Illustrative graphics, not production screenshots. No audio or remote assets.

- `npm ci`
- `npm run dev -- --no-open` opens Remotion Studio.
- `npm run lint` checks ESLint and TypeScript.
- `npm run build` checks the complete Studio bundle.
- `npm run build:player` rebuilds the static site player from this tools folder.
  Alternative output: `npm run build:player -- /absolute/path/journey-player.js`.

Players are explicitly muted, loop, and start when 20% of their observed area is
visible. The audience walkthrough waits until 60% of its console is visible, including on mobile.
Offscreen players, background tabs and players behind a dialog pause and resume
when visible again. All pause buttons share a single page-level preference.
Reduced motion is respected by default; explicit playback remains available.
No automatic scrolling, form submission, tab switching or focus movement.

The Audience Agent timeline drives request / rules / created every five seconds.
Try it yourself, focus on an input, or a manual action holds that timeline until
Resume walkthrough is selected. Visuals follow the manually selected step.
The retail sequence illustrates an observed match via a shared loyalty account,
not a causal sales uplift. Existing deeper manual examples remain available.

The website keeps SVG/image/HTML fallbacks when JavaScript fails or is disabled.
Sources and assets are local. Remotion versions are pinned to 4.0.545.
License for reuse: https://www.remotion.dev/license
