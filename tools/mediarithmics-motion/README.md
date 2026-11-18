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

The hero keeps the complete chain visible in one 720 × 440 scene (14 seconds).
Store, CRM and Video have distinct labelled pictograms. Animated signals follow
their exact curved paths into one person. The same cyan person then travels
into the centre of a fifteen-person customer base; a coral contour selects four people, before that audience activates
Email, Ads and Video with staggered moving signals and a second wave.
Identity grows to 1.55×, Audience and Campaign to 1.22×, while inactive
stages shrink to 0.76× and become grey at 50% opacity. Connections follow the
changing bounds to keep the chain continuous. The 16-beat narrative is sped
up by 8/7 and plays in 420 frames at 30fps (14 seconds).
Four of the fifteen people are selected inside a coral contour; the outer
customer-base panel stays neutral. Layered surfaces, inset highlights and
soft navy shadows add depth, as requested for this hero animation.
Labels are 18px; coloured stage names sit underneath. A full-colour overview
closes the loop. Reduced motion opens on that complete state (frame 385).
The static SVG fallback matches that final state.

The Audience Agent shows three natural-language requests at all times, with
no dropdown or required choice. A You avatar accompanies them. Suggested
criteria appear below the requests, before the people on mobile.
AudienceWalkthrough is 600 × 360, 1080 frames at 30fps: three examples of
12 seconds each. Request emphasis lasts two seconds, criteria emphasis two
seconds, then five of twelve varied illustrated portraits regroup over one
second. The final audience holds for almost seven seconds. `audienceTimeline.ts`
keeps HTML copy and Remotion portraits on the same example and stage.
A single header control pauses every animation; offscreen/background/dialog
and keyboard-focus gates are preserved. Reduced motion starts at frame 270
on the complete first example. The fallback SVG shows that same state. All
people and data are explicitly fictional, with no invented result count.
The retail sequence illustrates an observed match via a shared loyalty account,
not a causal sales uplift. Existing deeper manual examples remain available.

The website keeps SVG/image/HTML fallbacks when JavaScript fails or is disabled.
Sources and assets are local. Remotion versions are pinned to 4.0.545.
License for reuse: https://www.remotion.dev/license
