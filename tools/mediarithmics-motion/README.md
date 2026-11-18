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
visible, including the audience console on mobile.
Offscreen players, background tabs and players behind a dialog pause and resume
when visible again. One pause button in the sticky header controls all players.
Reduced motion is respected by default; explicit playback remains available.
No automatic scrolling, form submission, tab switching or focus movement.

The hero keeps the complete chain visible in one 720 × 440 scene (16 seconds).
Store, CRM and Video have distinct labelled pictograms. Animated signals follow
their exact curved paths into one person. The same cyan person then travels
into the centre of a nine-person audience, before that audience activates
Email, Ads and Video with staggered moving signals and a second wave.
Subtle zooms guide attention; the complete chain stays visible.
Reduced motion opens on the complete final state (frame 440).
The static SVG fallback matches that final state.

The Audience Agent timeline highlights request / rules / created every five seconds.
All three stages remain visible. Selecting a brief updates the complete example.
Input focus pauses the timeline; leaving the console resumes it. The 600 × 110
profile band stays compact on mobile.
The retail sequence illustrates an observed match via a shared loyalty account,
not a causal sales uplift. Existing deeper manual examples remain available.

The website keeps SVG/image/HTML fallbacks when JavaScript fails or is disabled.
Sources and assets are local. Remotion versions are pinned to 4.0.545.
License for reuse: https://www.remotion.dev/license
