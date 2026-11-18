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

The Audience Agent shows three clickable prospect roles: a TV & media audience
manager (coral), a retail media manager (green) and a brand CRM manager (orange).
Each has its own illustrated persona and request. The same colors identify the
solution tabs. Suggested criteria and an audience count accompany each request.
AudienceWalkthrough is 600 × 360, 540 frames at 30fps: three six-second examples.
Request and criteria emphasis last 0.6 seconds each; regrouping takes seven
frames (233 ms), then the completed result holds. Groups contain 4, 7 and 3 of
the 12 illustrative profiles, with different memberships and layouts.
`audienceTimeline.ts` keeps the portraits and HTML states synchronized.
Clicking or keyboard-activating a request seeks to that example and replays it;
while focus is within the console, it holds the completed selection. Offscreen,
background, dialog, reduced-motion and the header pause gates remain effective.
While paused or with reduced motion, clicking shows the completed state directly.
The build generates three SVG fallbacks from the same portrait component; these
remain selectable if the Player fails. Only explicit selections announce their
result to screen readers; autoplay never moves keyboard focus.
All people, roles and data are explicitly fictional illustration examples, not
product counts or customer performance claims.
The retail sequence illustrates an observed match via a shared loyalty account,
not a causal sales uplift. Existing deeper manual examples remain available.

The website keeps SVG/image/HTML fallbacks when JavaScript fails or is disabled.
Sources and assets are local. Remotion versions are pinned to 4.0.545.
License for reuse: https://www.remotion.dev/license
