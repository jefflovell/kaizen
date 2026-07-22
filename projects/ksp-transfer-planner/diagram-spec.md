# KSP Transfer Planner Diagram Spec

This file is the required gate before editing any technical SVG diagram in this project.

Do not implement a diagram from intuition. Do not "make it look right" by adding decorative paths. Every visible mark must be named in the card spec below or removed. If the mechanics are uncertain, stop and ask before editing SVG.

## Required Workflow

1. Pick exactly one card to change.
2. Fill or update that card's spec before touching SVG markup.
3. Reserve the marker badge box first.
4. Define the coordinate system and `viewBox`.
5. Define current geometry and delta geometry with exact coordinates.
6. Define craft position and rotation from the geometry.
7. Define burn/result vectors with start and end points.
8. List every visible stroke and its teaching purpose.
9. Render-check the card at actual grid size.
10. Remove any mark that is not explained by the spec.

## Acceptance Checklist

- The marker badge does not collide with orbit geometry, craft, arrows, labels, or nodes.
- The craft marker sits on the current trajectory.
- The craft rotation matches the local tangent or intended view convention.
- The burn vector is readable and does not pierce the craft/nose cone.
- Current orbit and delta orbit colors match the card's stated meaning.
- No broad decorative strokes, random tails, or left-to-right gradients are present.
- If a tapered motion cue is used, it is on the actual trajectory and is thickest at the exhaust-nozzle side, thinning toward the nose-cone side.
- If the diagram is top-down, all orbit changes are top-down; if it is edge-on, all plane geometry follows the edge-on convention.
- The diagram still reads at card size.

## Shared Constants

- Standard card `viewBox`: `0 0 320 210`.
- Marker badge default: `x=18`, `y=124`, `width=80`, `height=70`, `rx=8`.
- Marker image default: `x=25`, `y=128`, `width=64`, `height=64`.
- Badge reserved region: `x=18..98`, `y=124..194`.
- Planet body gradient may vary by card, but planet marks must not hide orbit geometry.

## Interactive Hohmann Lab Canvas

- Coordinate system: responsive CSS-pixel canvas; all geometry is recalculated from the rendered `width` and `height` at device-pixel ratio. The central body stays at `(width / 2, height / 2)`.
- Scale: the larger of the start and target orbital radii occupies `39%` of the shorter canvas dimension. Body radius is `max(18px, body.radius × scale)`.
- Current orbit: cyan `#5bd7eb` circle centered on the body at `r1 × scale`, drawn as a restrained `4 6` dotted reference path.
- Target orbit: green `#8ce66f` circle centered on the body at `r2 × scale`, drawn with the same dotted reference treatment.
- Transfer conic: ellipse centered at `center.x + ((r1 - r2) / 2) × scale`, with `rx = ((r1 + r2) / 2) × scale` and `ry = sqrt(r1 × r2) × scale`. Its full continuation is faint amber; the traveled upper half from burn 1 to burn 2 is stronger amber.
- Burn 1 node: `(center.x + currentRadius, center.y)`. Craft nose follows the upward current-orbit tangent. The separate burn vector points prograde for a raise and retrograde for a lower and uses navball maneuver green `#4cff4c`, independent of the amber transfer-conic color.
- Burn 2 node: `(center.x - targetRadius, center.y)`. Craft nose follows the downward transfer tangent. The separate circularization vector points prograde for a raise and retrograde for a lower and uses the same navball maneuver green `#4cff4c`, independent of the green target-orbit color.
- Navball instruction icons: each node uses the raw established `/assets/prograde-marker.png` or `/assets/retrograde-marker.png` glyph at `30×30px`. Center the glyph beside the craft at `(node.x + side × 34px, node.y)`, perpendicular to the vertical burn vector; Burn 1 prefers the right/outward side and Burn 2 the left/outward side. Do not place the icon beyond the vector arrowhead and do not add a badge, tile, border, or accent line. Center the green two-line `BURN N / Δv` note on the glyph, with Burn 1's note above and Burn 2's below. Measure the complete group's rendered width; if the preferred side cannot preserve a `10px` plot margin, flip the icon and note together to the craft's other side.
- Altitude-label collision rule: for raises, keep the start label in the inner orbit's lower-right quadrant and the target label in the outer orbit's upper-left quadrant. For lowers, move the outer start label to the lower-left quadrant and the inner target label to the upper-right quadrant, leaving the lower-right Burn 1 and upper-left Burn 2 instruction groups unobstructed.
- Current-orbit tail: 16 contiguous circle segments covering `100deg`, from approximately `t=100deg` to `t=0deg`, increasing through the approved taper and ending at burn 1.
- Transfer tail: 16 contiguous ellipse segments covering `100deg`, from approximately `t=-80deg` to `t=-180deg`, increasing through the approved taper and ending at burn 2.
- Craft: established orange `#ff704d` chevron with cream `#ffd7cc` outline; no glow. Labels use Courier Prime and stay clear of the craft and paths.
- Layering: drafting grid and faint range rings; current/target paths; faint full transfer and stronger traveled transfer half; body; tails; nodes and navball-green burn vectors; maneuver icons and live delta-v notes; craft and trajectory labels last.
- Forbidden: centering the transfer ellipse on the body, using radial craft arrows at either node, coloring a lab burn vector amber/cyan/orbit green, omitting or substituting the prograde/retrograde navball marker, wrapping a lab marker in a badge or tile, rendering neon orbit glows, detaching a tail from its conic, or changing the calculation model to satisfy the illustration.

## Interactive Inclination-Change Lab Canvas

- Coordinate system: responsive CSS-pixel canvas, recalculated from the rendered width and height at device-pixel ratio. The body is centered at `(width / 2, height / 2)`. Use `R = min(width × 0.34, height × 0.34)` so both projected planes and node callouts preserve a `24px` plot margin.
- Mechanics: the calculator models one impulsive plane change between circular orbits of the same radius. Both displayed plane angles use a signed `-180deg..+180deg` scale around the fixed line of nodes. Let `rawDelta = targetAngle - currentAngle`, normalize it to the shortest signed rotation `signedDelta` in `-180deg..+180deg`, then let `deltaI = abs(signedDelta)` in radians. Preserve the user's sign at the exact `180deg` tie. The required burn is `deltaV = 2 × v × sin(deltaI / 2)`. Treat `-180deg` and `+180deg` as the same retrograde plane. Do not change this calculation to fit the drawing.
- Projection model: render the reference, current, and target circular planes independently from the same 3D parameter `p(t, i) = (R cos(t), R sin(t) cos(i), R sin(t) sin(i))`, where the 3D `x` axis is their shared line of nodes and `i` is the absolute inclination of that plane. Project with `screenX = y + 0.14z` and `screenY = 0.22x - 0.72z`. The reference plane uses `i=0deg`, the cyan current plane uses the live current-inclination value, and the hot-pink target plane uses the live target-inclination value. This preserves the shared nodes at `(center.x, center.y ± 0.22R)` while ensuring each inclination slider moves only its corresponding orbit.
- Current orbit: cyan `#5bd7eb`, restrained `4 6` dotted path, sampled around the complete projected current circle. The rear half is lower opacity; the foreground half is redrawn after the body so the planet reads inside the ring.
- Target orbit: hot pink `#ff18b0`, the exact normal/anti-normal icon color, using the same dotted and rear/front depth treatment. Its projected geometry comes from the signed live inclination delta and shares both nodes with the current orbit.
- Reference plane: one faint horizontal node axis through the body plus three subordinate projected reference rings. These teach the shared line of nodes and may not compete with either orbit.
- Selected burn node: ascending uses the lower/foreground shared node `(center.x, center.y + 0.22R)`; descending uses the upper/rear shared node `(center.x, center.y - 0.22R)`. Draw the opposite node as a small, subordinate outlined point. Label both nodes `AN` and `DN`, keeping labels outside the body and craft.
- Body scale: `bodyRadius = clamp((body.radius / r) × R, 26px, 0.27R)`. The cap matches the approved Saturn-ring diagrams: altitude remains numerically exact in the calculator, while the explanatory projection stays readable and the body cannot erase its shared-node construction.
- Craft: established orange `#ff704d` chevron with cream `#ffd7cc` outline, centered on the selected node. Its nose follows the projected tangent of the live current plane at that node; derive the canvas rotation with `atan2(currentTangent.y, currentTangent.x)` rather than assuming a horizontal reference-plane tangent.
- Burn direction: a positive shortest plane rotation at the ascending node uses normal; positive at the descending node uses anti-normal. A negative shortest rotation reverses those assignments. A zero-degree change has no burn direction and no vector.
- Burn vector: hot pink `#ff18b0`, separated from the craft, `34px` stem plus a `7px` arrowhead. Normal points due north on the plot; anti-normal points due south. The vector is a navball-direction convention, not an orbit-color key.
- Navball instruction: use the raw `/assets/normal-marker.png` or `/assets/anti-normal-marker.png` glyph at `30×30px`, with no badge, tile, border, or decorative accent. Place it beside the craft, perpendicular to the burn vector, and put the live two-line `PLANE BURN / Δv` note horizontally beyond the icon. The complete icon/note group uses the craft's right side at the ascending node and left side at the descending node, preserving a `12px` plot margin.
- Plane-angle annotation: draw a single amber arc centered on the body between the live current-plane and target-plane projected tangent directions, with endpoint ticks and a live `Δi N°` label. Tangent lines are undirected for this measurement, so use the diametrically opposite equivalent arc: left of the body for an ascending-node burn and right for a descending-node burn. This keeps the annotation clear of the ship-side instruction group. It is an explanatory angular measure, not a trajectory or burn.
- Current-orbit tail: 16 contiguous segments on the actual cyan current-plane projection, covering `100deg` and ending at the selected node. At the ascending/lower node sample `t=-100deg..0deg`; at the descending/upper node sample `t=80deg..180deg`. Pass the live current inclination into every segment projection and apply the approved shared width and opacity progression.
- Layering: faint drafting grid and reference plane; rear halves of current and target orbits; body; foreground orbit halves; plane-angle annotation; selected/opposite nodes; current-orbit tail; burn vector; navball instruction; craft and labels last.
- Controls: both plane-angle sliders run from `-180deg` at the left edge through `0deg` at the center to `+180deg` at the right edge, with visible endpoint and center labels. Expose AN node and DN node selection only. Do not include Hohmann's `Swap` shortcut; the two signed sliders already define the direction of the plane change explicitly.
- Forbidden: normalizing the current plane to zero and applying both controls to the pink target geometry, rotating two unrelated ellipses until they look inclined, allowing current and target paths to miss at the node, placing the craft anywhere except the selected shared node, drawing a prograde/retrograde vector, using green for a normal/anti-normal burn, adding a second circularization burn, detaching the tail from the projected current orbit, or implying that an instantaneous plane change alters orbital altitude.

## Interactive Combined Transfer + Plane-Change Lab Canvas

- Coordinate system: responsive CSS-pixel canvas, recalculated from the rendered width and height at device-pixel ratio. Center the body at `(width / 2, height / 2 + 8px)` and let `R = min(width x 0.42, height x 0.42)`. Map the larger of `r1` and `r2` to `R`; the other orbit and transfer ellipse use the same linear scale. Preserve at least `30px` between any projected orbit and the plot edge.
- Mechanics: model one impulsive Hohmann injection followed by one simultaneous circularization and plane change at the opposite apsis. Let `r1 = bodyRadius + startAltitude`, `r2 = bodyRadius + targetAltitude`, `a = (r1 + r2) / 2`, `v1 = sqrt(mu / r1)`, `v2 = sqrt(mu / r2)`, `vt1 = sqrt(mu(2/r1 - 1/a))`, and `vt2 = sqrt(mu(2/r2 - 1/a))`. Burn 1 is `abs(vt1 - v1)`. Normalize `targetAngle - currentAngle` to the shortest signed `-180deg..+180deg` rotation, preserving the user's sign at an exact `180deg` tie. Burn 2 is the velocity-vector difference `sqrt(vt2^2 + v2^2 - 2 vt2 v2 cos(deltaI))`; never replace it with the sum of circularization and plane-change magnitudes.
- Comparison baseline: show `Burn 1 + abs(v2 - vt2) + 2 v2 sin(deltaI/2)` as “separate at target,” and the nonnegative difference from the combined total as the displayed savings. State that this is a comparison with circularizing and then changing plane at the target orbit, not a claim of global mission optimality.
- Projection model: keep the reference orbital system horizontal and rotate each live plane around the front/back `Y` axis—not around the canvas. For a circular point use `X = r sin(t) cos(i)`, `Y = r cos(t)`, and `Z = -r sin(t) sin(i)`, then project directly with `screenX = center.x + (X + 0.14Z) scale` and `screenY = center.y + (0.36Y - 0.72Z) scale`. Both planes therefore share the near node at `t=0` on the lower vertical midline and the far node at `t=pi` on the upper vertical midline while the zero-degree orbit stays a readable horizontal Saturn ring. For the transfer conic let `s = c + a cos(t)` on the invariant front/back axis and `q = b sin(t)` across the live current plane, where `c = (r1 - r2)/2` and `b = sqrt(r1 r2)`; use `X = q cos(currentI)`, `Y = s`, and `Z = -q sin(currentI)`. Departure is `t=0` at the near/lower apsis `+r1`; arrival is `t=pi` at the far/upper apsis `-r2`. Do not rotate the complete canvas projection.
- Paths: current orbit is cyan `#5bd7eb`; transfer conic is amber `#f5b447`; target/inclined orbit is hot pink `#ff18b0`. Use restrained `4 6` dotted strokes. Draw the complete transfer conic faintly and the traveled `t=0..pi` half stronger. The target path deliberately shares hot pink with the normal/anti-normal maneuver axis so the inclined plane reads immediately; navball green remains reserved for tangential prograde/retrograde components.
- Depth: split each projected circular orbit and the transfer ellipse into rear and foreground halves. Draw rear paths, then the body, then foreground paths so the planet remains visibly inside all rings. Body radius is `clamp((body.radius / max(r1,r2)) x R, 24px, 0.17R)`; the tighter cap keeps both front/back maneuver nodes outside the planet silhouette. This visual clamp does not change any calculation.
- Burn 1: place the craft at the projected `t=0` departure node and derive its nose from the current-orbit tangent with `atan2`. Use one raw prograde or retrograde marker beside the craft, a navball-green `#4cff4c` tangential burn vector, and the live `BURN 1 / delta-v` note. Raising uses prograde and lowering uses retrograde.
- Combined Burn 2: place the craft at the projected `t=pi` arrival node, tangent to the transfer path. Mark both target-plane node-axis crossings: the selected arrival node at `t=pi` uses a stronger hot-pink point and `AN` or `DN` label; the opposite target-orbit crossing at `t=0` uses a subordinate outlined point and the opposite label. Anchor the front/lower node label at `(node.x - 12px, node.y + 3px)`, right-aligned so it sits directly left of the circular indicator rather than below it; keep the far/upper label above-left to clear the arrival craft. Draw a velocity-component construction from one shared origin beside the arrival node: the tangential component is navball green and uses prograde or retrograde according to the sign of `v2 cos(deltaI) - vt2`; the plane component is hot pink `#ff18b0` and uses normal or anti-normal from the signed rotation and selected arrival node. Draw a thin cream resultant from the shared origin to the vector sum. Scale the longest component to no more than `48px`; the diagram explains direction and relative composition while the numeric readout remains authoritative.
- Combined instruction: show the raw tangential maneuver marker and raw normal/anti-normal marker as a compact side-by-side pair beside the arrival craft, with no badges, tiles, borders, or invented combined glyph. Put the live two-line `BURN 2 COMBINED / delta-v` note adjacent to the pair and keep the group inside a `12px` plot margin. Below `500px` canvas width, move Burn 1's marker to `(width - 52px, departure.y - 55px)` with its notes right-aligned at `width - 8px`, and center the Burn 2 marker pair at `(52px, arrival.y + 78px)` with its notes left-aligned at `8px`; this keeps both instruction groups outside the body while preserving their node association.
- Node convention: expose AN and DN arrival-node selection. A positive shortest plane rotation uses normal at AN and anti-normal at DN; a negative rotation reverses the rule. Changing AN/DN changes the plane-component instruction without changing the ideal scalar delta-v. A zero plane change omits the hot-pink component and its marker.
- Motion tails: use 16 contiguous projected segments with the approved shared taper. The cyan current-orbit tail samples `t=-100deg..0deg` and ends at Burn 1. The amber transfer tail samples `t=80deg..180deg` and ends at Burn 2. Every segment is calculated from the same live plane and conic projection as its base path.
- Layering: drafting grid and the unrotated horizontal reference plane; rear halves from `t=90deg..270deg` of the current, transfer, and hot-pink target paths; body; foreground halves from `t=-90deg..90deg`; tails; both target-plane node crossings on the vertical midline; departure and arrival craft nodes; component construction and maneuver markers; craft and labels last.
- Controls: body, start altitude, target altitude, signed current plane, signed target plane, and AN/DN arrival node. Both plane controls run `-180deg..0deg..+180deg` and move only their named orbit. Do not carry over a generic Swap control.
- Forbidden: adding circularization and plane-change magnitudes and labeling the result combined, coloring Burn 2 wholly green or wholly hot pink, rendering the inclined target plane green, tilting the complete orbital system to move the nodes, leaving the shared node axis as an ambiguous horizontal left/right line, using one generic combined-burn icon, missing either conic node, introducing kinks between conics, placing a craft off its local tangent, detaching a tail from its projected path, or altering the mechanics to improve the drawing.

## Interactive Geosynchronous / Geostationary Lab Canvas

- Mechanics: calculate the synchronous orbital radius from the selected body's sidereal rotation period with `rSync = cbrt(mu x (rotationPeriod / 2pi)^2)` and `syncAltitude = rSync - bodyRadius`. Compare `rSync` with the body's stock sphere-of-influence radius before presenting the orbit as usable. A geostationary target is circular, equatorial, prograde, and synchronous; a geosynchronous target keeps the same period and semi-major axis but may use a nonzero inclination. Do not describe an inclined target as stationary.
- Transfer model: start from the live circular parking orbit `r1`. Let `r2 = rSync`, `a = (r1 + r2) / 2`, and use the established Hohmann injection velocities. Burn 1 is the tangential difference at `r1`. Burn 2 is the velocity-vector difference between the arriving transfer and the circular synchronous target: `sqrt(vt2^2 + v2^2 - 2 vt2 v2 cos(deltaI))`. Stationary mode fixes `deltaI = 0`; synchronous mode exposes a signed target inclination and AN/DN arrival-node selection.
- Coordinate system: reuse the combined-lab front/back-axis projection. Center the body at `(width / 2, height / 2 + 10px)`, map the largest of the parking radius, synchronous radius, and SOI radius used in the visible comparison to `R = min(width x 0.40, height x 0.40)`, and clamp the body to `24px..0.18R`. For valid bodies, keep the SOI boundary subordinate and scale the two working orbits to the plot. For an invalid synchronous radius, scale the SOI boundary and required synchronous target together so the target is visibly outside the SOI rather than hiding the failure in copy.
- Paths: parking orbit is cyan `#5bd7eb`, transfer conic is amber `#f5b447`, and synchronous target orbit is green `#8ce66f`. Use the established restrained dotted references, stronger traveled transfer half, planet-inside-the-ring rear/body/front layering, and 16-segment tails ending at both burns. In inclined synchronous mode, project only the green target plane by the live inclination; do not tilt the equatorial parking orbit, transfer conic, body, or canvas.
- Stationary lock: in stationary mode, draw one thin subordinate radial alignment from the arrival craft to a surface-longitude tick and label it `SAME LONGITUDE`. This is a physical longitude-lock annotation, not a trajectory, burn vector, or decorative construction line. Add one restrained amber body-rotation arc labeled with the sidereal period so the equal-period relationship is explicit.
- Synchronous ground track: when inclination is nonzero, replace the stationary-lock annotation with a small labeled ground-track inset using one continuous green figure-eight curve. The inset represents the latitude oscillation of an inclined circular synchronous orbit; it is not another orbit around the body and must stay visually separate from the main conics.
- Burn 1: use the established orange craft tangent to the parking orbit, navball-green prograde/retrograde burn arrow, raw maneuver icon, and live `BURN 1 / delta-v` note. Raising uses prograde; lowering uses retrograde.
- Burn 2: place the craft at the exact transfer/target arrival node and follow the transfer tangent. Stationary mode uses one navball-green tangential component and one prograde/retrograde marker. Inclined synchronous mode uses the established combined-burn construction: green tangential component, hot-pink normal/anti-normal component, thin cream resultant, and the two raw marker glyphs. AN/DN changes the normal-axis instruction without changing scalar ideal delta-v.
- SOI failure state: draw the SOI boundary in restrained coral, label both the boundary and required synchronous radius, replace burn totals with theoretical values clearly marked as unusable, and display `OUTSIDE SOI` beside the target. Never draw a completed stable target orbit without the failure treatment when `rSync >= soiRadius`.
- Readouts: synchronous altitude, sidereal/orbital period, target speed, Burn 1, Burn 2, total transfer delta-v, target inclination, SOI margin, and validity. Parking altitude remains user-controlled; synchronous altitude is computed and never exposed as an arbitrary target slider.
- Controls: body, parking altitude, stationary/synchronous mode, signed target inclination, and AN/DN arrival node. Stationary mode disables and resets target inclination to zero. Synchronous mode restores the last nonzero inclination. Do not include Hohmann's target-altitude slider or Swap shortcut.
- Forbidden: using a solar-day approximation instead of the sidereal rotation period; treating equal period alone as stationary; allowing a geostationary inclination other than zero; hiding an outside-SOI solution; drawing the ground-track figure eight as a space trajectory; moving the parking orbit when inclination changes; using amber or orbit green for navball maneuver directions; detaching either motion tail; or placing either craft off its local tangent.

## Interactive Resonant Constellation Lab Canvas

- Mechanics: for `N` evenly spaced satellites in a circular target orbit with period `T`, the standard inner phasing orbit uses `Tphase = T x (N - 1) / N`; the outer option uses `Tphase = T x (N + 1) / N`. Recover the phasing semi-major axis from Kepler's third law and place its shared apsis exactly on the target circle. The opposite apsis is `2aPhase - rTarget`. One carrier lap advances the deployed target-orbit craft by exactly one `360deg / N` slot relative to the release point.
- Deployment assumption: leave one craft in the final circular orbit, inject the carrier and remaining stack onto the resonant ellipse, then release one craft per carrier lap. Each released craft circularizes at the shared apsis. Show the completion time as `(N - 1) x Tphase` and the campaign ideal delta-v as one carrier injection plus `N - 1` satellite circularizations. State that assumption rather than presenting the sum as a universal vehicle budget.
- Inner / outer burns: entering an inner phasing orbit from the target circle is retrograde and each released craft circularizes prograde at shared apoapsis. Entering an outer phasing orbit is prograde and each released craft circularizes retrograde at shared periapsis. Maneuver arrows and raw glyphs use navball green; the final orbit remains green and the carrier conic remains amber independently.
- Coordinate system: keep the horizontal Saturn-ring projection with the body at the common focus. The target circle and resonant ellipse must meet tangentially at the right-side deployment apsis. Center the resonant ellipse from its physical apsides; never draw a decorative offset oval, kink the path into the target orbit, or move the body away from the ellipse focus. Because this side apsis is perspective-compressed, do not use a rigid vertical ship or straight vertical burn vector there: both cues must visibly follow the projected orbit curvature so they cannot be mistaken for normal/anti-normal motion.
- Release-node geometry: keep the mathematical burn node at carrier parameter `t=0`. Render the orange craft as a short curved orbit-following chevron whose spine samples the carrier conic from `t=-26deg` to `t=0` for prograde circularization and from `t=+26deg` to `t=0` for retrograde circularization. The chevron nose terminates exactly on the shared apsis and its axis uses the conic's terminal derivative. Draw the separate navball-green burn vector on a parallel projected arc offset `12px` radially outside the right apsis, from `t=+2deg` through `+32deg` for prograde and `t=-2deg` through `-32deg` for retrograde. Its arrowhead axis continues the terminal arc tangent and its flat back is perpendicular to that tangent. Center the raw prograde/retrograde glyph approximately `44px` horizontally beside the craft, clamped inside the canvas, with `RELEASE / BURN` directly above and the live delta-v directly below; never park this group diagonally behind the ship or beyond the burn arrowhead.
- Paths and craft: draw the target circle green, carrier ellipse amber, and deployed satellite pips yellow-green. Rear arcs pass behind the body and front arcs pass over it. Use the approved 16-segment tail on the carrier path into the release craft and a second approved tail into one deployed target-orbit craft. Keep every satellite pip tangent to its local path and keep the curved release craft at the exact shared apsis.
- Safety: an inner resonance is invalid when its opposite apsis intersects the body or atmosphere; an outer resonance is invalid when its opposite apsis exits the selected body's sphere of influence. Draw the relevant boundary in restrained coral and mark delta-v values as theoretical. For an unsafe inner orbit, recommend the outer side, a higher final orbit, or more satellites. For an unsafe outer orbit, recommend the inner side, a lower final orbit, or more satellites.
- Readouts: period ratio, opposite phasing apsis altitude, target period, carrier-lap release interval, slot angle, carrier injection delta-v and direction, each satellite circularization delta-v, deployment completion time, and the campaign delta-v under the stated assumption.
- Controls: body, final circular altitude, satellite count, and inner/outer phasing side. Satellite count runs from 2 through 12. Do not expose an arbitrary phasing altitude control; resonance and target altitude determine it.
- Forbidden: placing the shared node anywhere except a tangent apsis; using a rigid vertical craft or straight vertical burn vector at the perspective-compressed side apsis; detaching the maneuver glyph from the release craft; confusing the period ratio order; using the target orbital period as the release interval; drawing already deployed satellites unevenly; showing the same burn direction for inner and outer circularization; hiding atmosphere, surface, or SOI failures; adding non-physical spokes between spacecraft; or substituting one generic dotted circle for the actual resonant ellipse.

## Interactive Repeat Ground Track Lab Canvas

- Mechanics: a circular ground track repeats when an integer number of orbital revolutions and integer number of body sidereal rotations complete together. For requested counts `Norb` and `Nday`, use `Torbit = Trotation x Nday / Norb`, then recover the only circular radius satisfying that period with Kepler's third law. Reduce the ratio by its greatest common divisor for the actual repeat cycle; do not show duplicate laps as extra coverage.
- Ground projection: calculate the live sub-satellite point from a circular inclined orbit in body-fixed coordinates. With argument of latitude `u`, use inertial position `(cos u, sin u cos i, sin u sin i)`, derive inertial longitude with `atan2`, then subtract the body's sidereal rotation angle before wrapping longitude to `-180deg..+180deg`. Latitude is `asin(sin u sin i)`. Split the drawn path at the dateline rather than connecting it across the map with a false horizontal chord.
- Coordinate system: use a framed equirectangular longitude/latitude plot with the equator and prime meridian stronger than the subordinate 30-degree graticule. Label cardinal longitude and latitude ticks, tint only the reachable latitude band, and keep the map a technical surface trace rather than an invented planet texture.
- Paths and direction: render the complete reduced-cycle track as a restrained cyan dashed curve. Apply the approved 16-segment yellow-green tail over 100 degrees of orbital travel into one orange craft, tangent to the local projected track. Mark the first/final equator crossing with the hot-pink repeat node and mark intermediate same-direction equator crossings as subordinate points. A thin yellow-green equator arrow may identify the westward longitude shift per orbit; do not add spokes from the body center.
- Inclination: signed longitude behavior comes from the orbital projection. Effective latitude reach is `min(i, 180deg - i)`; values below 90 degrees are prograde, 90 degrees is polar, and values above 90 degrees are retrograde. Inclination changes the trace and coverage band but not the period-derived altitude.
- Safety: reject a radius inside the body, below the atmosphere ceiling, or outside the sphere of influence. Use the restrained coral failure treatment and mark altitude and speed as theoretical. For low solutions recommend fewer orbits per cycle or more body rotations; for outside-SOI solutions recommend more orbits or fewer rotations.
- Readouts: required circular altitude, reduced repeat ratio, reduced repeat interval, orbital period, westward longitude step per orbit, final track spacing, circular speed, effective latitude band, and prograde/polar/retrograde direction.
- Controls: body, requested orbit count from 1 through 24, requested body rotations from 1 through 8, and inclination from 0deg through 180deg. Altitude is computed and must not be exposed as an independent control.
- Forbidden: using a solar day instead of sidereal rotation; presenting an unreduced ratio as a longer unique cycle; using a decorative sine wave unrelated to the selected inclination and rotation; joining wrapped dateline segments; calling repeat ground track stationary; allowing altitude to vary independently of the timing ratio; changing altitude when only inclination moves; or hiding invalid body, atmosphere, and SOI solutions.

## Interactive Polar Mapping Lab Canvas

- Mechanics: use a live circular orbit with `r = bodyRadius + altitude`, `T = 2pi sqrt(r^3 / mu)`, and `v = sqrt(mu / r)`. The body rotates by `deltaLambda = 360deg x T / siderealRotation` during each orbit, so the inertially fixed orbital plane peels west across the body-fixed map. Use the selected absolute inclination directly; effective latitude reach is `min(i, 180deg - i)` and the direction is prograde below `90deg`, polar at `90deg`, and retrograde above `90deg`.
- Coverage solver: treat the user-selected scanner swath as a full surface central angle. Generate the longitude of every successive half-orbit equator crossing with the same body-fixed state transform used by the repeat-ground-track lab. After each crossing, sort the accumulated longitudes on a circle and measure the largest wrap-aware gap. The mapping estimate completes only when that gap is no wider than one full swath. Search at least `1,440` half-orbit crossings; if the pattern repeats without closing the gap, report `COVERAGE STALLS` rather than inventing a completion time. Global coverage also requires `latitudeReach + swath / 2 >= 90deg`.
- Coordinate system: use the established framed equirectangular plot with longitude `-180deg..+180deg` and latitude `-90deg..+90deg`. Strengthen the equator and prime meridian, keep the `30deg` graticule subordinate, and watermark the selected body name beneath the data. Shade only the geometrically reachable latitude band. When polar caps remain outside the swath, tint those cap bands coral and label the missed angular extent.
- Pass rendering: draw a finite representative sequence of up to twelve complete orbital tracks using the real body-fixed ground-state equations. Render each scanner footprint as a wide low-opacity cyan stroke, then overlay its dashed cyan centerline. Split both strokes whenever longitude wraps across the dateline. Earlier passes remain subordinate; the newest displayed pass carries the strongest centerline.
- Direction and gaps: place one orange craft on the newest displayed track, tangent to its local projected direction, with the approved 16-segment yellow-green tail spanning approximately `100deg` of orbital travel and terminating at the craft. At the equator, draw one thin amber westward arrow for the per-orbit longitude peel. Mark the current largest unresolved equatorial gap with hot-pink endpoints and a restrained double-ended bracket; remove that gap annotation when the simulated swaths close it.
- Safety: reject an orbit whose radius intersects the body, remains at or below the atmosphere ceiling, or reaches/exceeds the sphere of influence. Use the established coral failure state and mark all coverage-duration results theoretical. Keep the drawn altitude and swath geometry visible so the recovery action remains understandable.
- Controls: body; circular altitude with body-specific minimum, maximum, step, and default; inclination from `60deg` through `120deg` with `90deg` centered; and full scanner swath from `2deg` through `40deg`. Altitude changes period, speed, and longitude peel. Inclination changes latitude reach but not circular period. Swath changes surface width and completion criteria without changing the orbit.
- Readouts: orbit/coverage status, latitude reach, estimated mapping time, required equator-crossing passes, longitude peel per orbit, circular period, circular speed, equatorial swath width, largest remaining gap, and direction.
- Forbidden: replacing the orbital calculation with a decorative sine wave; drawing a swath across a dateline wrap; counting one orbit as one surface pass; estimating completion from swath width without the rotating-body longitudes; claiming full-globe coverage while polar caps remain; changing period when only inclination or swath moves; adding spokes from a map center; or using a rigid craft that is not tangent to the projected ground track.

## Interactive Retrograde Orbit Lab Canvas

- Mechanics: use a live circular target with `r = bodyRadius + altitude`, `v = sqrt(mu / r)`, and `T = 2pi sqrt(r^3 / mu)`. At launch latitude `phi`, the site already moves east at `vSurface = 2pi bodyRadius cos(phi) / siderealRotation`. For target inclination `i`, resolve the inertial circular velocity at the launch point with `vEast = v cos(i) / cos(phi)` and `vNorth = sqrt(v^2 - vEast^2)`. The ideal ground-relative insertion is `sqrt((vEast - vSurface)^2 + vNorth^2)`. Compare it with the mirrored prograde inclination `180deg - i`, not with a zero-inclination orbit of different geometry.
- Reachability and heading: controls expose target inclination from `90deg` through `180deg` and absolute launch latitude from `0deg` through `60deg`. A direct retrograde launch is reachable only through `180deg - latitude`; reject a target beyond that limit. For the displayed northbound solution use `sin(heading) = cos(i) / cos(phi)`, normalize heading to `0deg..360deg`, and label the cardinal direction. Do not invent a direct heading for an unreachable plane.
- Coordinate system: reuse the front/back-axis projected-ring grammar. Keep the equatorial reference cyan and project the hot-pink target plane by the geometric tilt `180deg - i`, so `180deg` correctly shares the equatorial plane while traveling in the opposite direction. Draw rear orbit halves first, then the body, then foreground halves. The body remains inside both rings.
- Direction cues: draw one amber eastward rotation arc on the body and one orange craft at the foreground node traveling retrograde. The craft follows the exact target-path tangent. Apply the approved 16-segment hot-pink tail over approximately `100deg` of the target path into the craft in the retrograde direction. The live insertion vector and raw retrograde navball glyph use maneuver green `#4cff4c`; they remain independent from the hot-pink trajectory color.
- Cost comparison: reserve a subordinate ledger beside the orbit for two proportional bars: mirrored prograde ideal insertion in cyan and retrograde target insertion in hot pink. Label the difference `ROTATION TAX` and repeat the live value in the readout panel. State directly on the plot that gravity, aerodynamic, and steering losses are excluded.
- Safety: reject a target at or below the atmosphere ceiling, at or beyond the sphere of influence, or outside direct-launch reachability. Use the standard coral failure treatment while leaving the intended geometry visible. The UI must distinguish `DIRECT LAUNCH IMPOSSIBLE`, `INSIDE ATMOSPHERE`, and `OUTSIDE SOI`.
- Readouts: ideal retrograde insertion, mirrored prograde baseline, rotation penalty, launch heading, circular speed, local surface-rotation speed, orbital period, reachable retrograde inclination range, and direction.
- Forbidden: drawing a westbound craft with an eastbound tail; treating `180deg` as a visibly tilted plane; comparing against an unrelated prograde orbit; calling the ideal vector difference a complete ascent delta-v; using hot pink for the maneuver glyph; hiding impossible launch geometry; placing the craft off the target tangent; or drawing the body above the complete foreground orbit.

## Interactive Elliptical Orbit Lab Canvas

- Mechanics: let `rp = bodyRadius + periapsisAltitude`, `ra = bodyRadius + apoapsisAltitude`, `a = (rp + ra) / 2`, `e = (ra - rp) / (ra + rp)`, and `b = sqrt(rp x ra)`. Use vis-viva for both apsis speeds and `T = 2pi sqrt(a^3 / mu)` for the period. Periapsis must remain strictly below apoapsis in the controls; do not silently swap their semantic labels.
- Entry strategies: entry at PE starts from the circular `rp` orbit, burns prograde by `vPE - vCircularPE`, and reaches AP after `T / 2`; optional prograde circularization costs `vCircularAP - vAP`. Entry at AP reverses the sequence with retrograde burns: start from the circular `ra` orbit, lower PE, coast to it, and optionally circularize there. Burn 2 is explicitly optional because omitting it preserves the selected ellipse.
- Coordinate system: use a top-down focus-correct ellipse. Fit the complete span from left apoapsis to right periapsis inside the plot, place the body at the physical focus, set the ellipse center offset to `(rp - ra) / 2` from that focus, and scale the semi-minor axis from `sqrt(rp x ra)`. Apsis nodes, labels, craft, local circle arcs, and the dotted ellipse must all share those exact coordinates.
- Paths and direction: keep only a local cyan arc of the selected entry circle and a local green arc of the optional exit circle so a very large apoapsis circle does not crush the designed ellipse. Draw the complete amber ellipse as the final orbit, with the first coast half stronger and the continuation restrained. Apply one approved 16-segment cyan tail into Burn 1 and one approved 16-segment amber tail into the opposite apsis craft. Both craft use the orange chevron and remain tangent to their respective current paths.
- Burn callouts: both prograde and retrograde vectors use navball green `#4cff4c` and the matching raw marker glyph without a badge. Callouts stay beside their craft and identify `ENTRY / PE`, `ENTRY / AP`, `OPTIONAL / AP`, or `OPTIONAL / PE` plus live delta-v. Trajectory color never replaces maneuver-direction color.
- Safety: `periapsisAltitude <= 0` is `IMPACT TRAJECTORY`; a positive periapsis at or below the atmosphere ceiling is `ATMOSPHERIC PASS`; `ra >= sphereOfInfluence` is `APOAPSIS OUTSIDE SOI`. Preserve the intended conic in coral and mark computed values theoretical rather than hiding the geometry.
- Readouts: status, entry delta-v, optional circularization delta-v, total if circularized, half-period coast time, periapsis speed, apoapsis speed, period, semi-major axis, and eccentricity.
- Forbidden: centering the body in the ellipse; drawing a hand-tuned oval unrelated to the apsis radii; showing complete giant circular reference rings that make the ellipse unreadable; calling optional Burn 2 mandatory; using amber or green for navball vectors; detaching either tail; pointing a craft radially; allowing PE to equal or exceed AP; or presenting an atmospheric/impact/SOI-crossing conic as a safe bound orbit.

## Interactive Molniya-Style Orbit Lab Canvas

- Mechanics: select a sidereal-day denominator `n`, set `T = bodyRotation / n`, derive `a = cbrt(mu (T / 2pi)^2)`, let `rp = bodyRadius + periapsisAltitude`, and solve `ra = 2a - rp`, `e = (ra - rp) / (ra + rp)`, and `b = sqrt(rp ra)`. Use vis-viva at both apsides and compare the periapsis ellipse speed with the circular `rp` speed for the prograde injection delta-v.
- Dwell: place argument of periapsis at `270deg` for northern apoapsis or `90deg` for southern apoapsis. Compute time above the selected latitude from uniform mean-anomaly samples, Kepler's equation, true anomaly, and `latitude = asin(sin(i) sin(omega + nu))`; do not infer dwell from the screen-space hot-pink arc length.
- Coordinate system: project a focus-correct ellipse from its inclined orbital plane. Keep the body at the physical focus, the apoapsis over the selected hemisphere, and the periapsis opposite it. The shallow cyan equator reference and selected-latitude surface band establish north/south geometry without rotating the body away from the plot center.
- Paths and direction: draw the complete designed ellipse amber, overlay only the qualifying dwell segment hot pink, and retain a local cyan circular entry arc at periapsis. Use the orange tangent craft at both apsides, one approved 16-segment cyan tail into the periapsis burn, and one approved 16-segment hot-pink tail into the apoapsis craft.
- Burn callout: injection is prograde at periapsis. Its vector and raw prograde navball glyph use maneuver green `#4cff4c`; the glyph sits beside the craft callout rather than ahead of the vector. Trajectory colors never substitute for maneuver-direction color.
- Safety and teaching: default to `1:2` sidereal day, `63.4deg`, and a safe low periapsis. State that `63.4deg` suppresses J2-driven apsidal drift on an oblate real planet while stock KSP does not model that precession. Flag atmospheric periapsis, latitude targets above inclination, eccentricity below the high-ellipse regime, and apoapsis at or beyond the SOI.
- Readouts: status, apoapsis altitude, dwell time above the selected latitude, prograde injection delta-v, orbital period, eccentricity, periapsis and apoapsis speeds, latitude reach, repeat cadence, and SOI margin.
- Forbidden: centering the body in the ellipse; allowing the hot-pink dwell arc to disagree with the computed latitude threshold; drawing a radial craft; using hot pink for the burn vector; calling `63.4deg` mechanically privileged in stock KSP; hiding an SOI escape behind display scaling; or presenting one satellite as continuous high-latitude coverage.

## Interactive Bi-Elliptic Transfer Lab Canvas

- Mechanics: accept circular start radius `r1`, circular target radius `r2`, and shared intermediate apoapsis `rb > max(r1, r2)`. Set `a1 = (r1 + rb) / 2` and `a2 = (r2 + rb) / 2`; use vis-viva at the three tangent nodes and sum the magnitudes of the velocity discontinuities. Coast time is the sum of the two half-periods. Compute a Hohmann transfer between the same endpoints as a live baseline.
- Verdict: compare the actual finite-`rb` delta-v totals and show the time penalty. The `11.94` radius-ratio result is an asymptotic teaching reference, not an automatic win condition for every finite intermediate apoapsis.
- Geometry: keep the body at the shared focus. Ellipse 1 leaves the start circle, reaches the left-side shared apoapsis, and ellipse 2 continues smoothly from that tangent node to the target circle. When physical radius ratios make the inner geometry unreadable, use declared compressed display radii while preserving focus, apsis order, tangency, and all physical calculations.
- Paths: start circle cyan `#5bd7eb`, first ellipse amber `#f5b447`, second ellipse hot pink `#ff18b0`, target circle green `#8ce66f`. Keep complete reference paths faint and dashed, strengthen only the traveled half of each transfer ellipse, and use one approved 16-segment tail into each of the three burns.
- Burn nodes: Burn 1 is prograde because the intermediate apoapsis is above the start orbit. Burn 2 is prograde for an outward endpoint change and retrograde for an inward endpoint change. Burn 3 is retrograde at the target periapsis to circularize. All vectors and raw navball glyphs use maneuver green `#4cff4c`; orange craft stay tangent to their incoming paths and icons sit beside the craft rather than ahead of the vector.
- Safety and readouts: flag atmospheric endpoints, `rb <= max(r1, r2)`, and `rb >= SOI`. Show three burn magnitudes and directions, bi-elliptic total, Hohmann total, fuel difference, total bi-elliptic coast time, time penalty, endpoint radius ratio, and SOI margin.
- Forbidden: drawing either ellipse through the body; placing a kink at the shared apoapsis; using trajectory colors for maneuver vectors; using a radial craft; hiding display compression; claiming `11.94` guarantees savings at finite `rb`; omitting the Hohmann baseline; or presenting an SOI-crossing path as a valid one-body transfer.

## Interactive Launch Site Assist Lab Canvas

- Mechanics: for body radius `R`, sidereal rotation period `T`, latitude `phi`, circular-orbit speed `vOrbit`, and target inclination `i`, compute local eastward speed `vSurface = 2 pi R cos(phi) / T`. A direct launch exists only when `abs(cos(i) / cos(phi)) <= 1`, equivalently `abs(phi) <= i <= 180deg - abs(phi)`, with the polar-site limit handled explicitly. The northbound inertial track azimuth is the normalized solution of `asin(cos(i) / cos(phi))`; the southbound solution is `180deg - northbound`. For each solution, form the desired inertial vector `vOrbit * (east = sin(A), north = cos(A))`, subtract the local surface vector `(east = vSurface, north = 0)`, and report the rocket-relative steering heading `atan2(vRocketEast, vRocketNorth)`. Resolve surface rotation along and across the inertial track, and derive rocket-relative horizontal speed from the same vector difference, never scalar subtraction.
- Coordinate system: use a perspective globe centered in the canvas with a vertical north/south spin axis. Project the selected latitude as an amber shallow ellipse on the body. Put the site at that ellipse's foreground midpoint `t=90deg`, establishing conventional screen-right as local east and screen-up as local north. Project the target orbital plane as a body-centered ellipse whose screen-space opening grows with the geometric plane tilt `min(i, 180deg - i)`; retrograde changes the direction of travel without inventing a different physical plane.
- Paths and depth: latitude ring amber `#f5b447`, target plane hot pink `#ff18b0`, surface-rotation vector cyan `#5bd7eb`, and ideal rocket-relative launch-heading or first reachable plane green `#8ce66f`. Draw the complete dashed target ellipse behind the body, then redraw its foreground half `t=0deg..180deg` over the planet after the body layer. Move the complete approved 16-segment tail to the appropriate foreground plane so it remains continuous across the planet and into the craft; never let the body clip the near-side orbit. For ground-relative azimuth `Arocket` measured clockwise from north, map the screen vector as `(sin(Arocket), -cos(Arocket))`; therefore `090deg` points screen-right with the prograde spin, `270deg` points screen-left against it, `000deg` points north, and `180deg` points south. Do not bend this vector toward a cosmetically chosen spacecraft or present it as an ascent trajectory.
- Site, annotations, and craft: place one amber site node at the latitude ring's visible foreground midpoint. Draw the eastward cyan surface vector tangent to that ring toward screen-right. Offset the cyan spin vector and green heading vector upward from the site so neither sits on the foreground target arc; place their labels on the open upper side of each vector and move the `LAUNCH SITE` label below the front arc. Put the prograde craft on the target ellipse's foreground-right quadrant at approximately `t=45deg`, tangent up-right; put the retrograde craft on the foreground-left quadrant at approximately `t=135deg`, tangent up-left. Do not add a navball maneuver icon or node burn vector; the launch vehicle is following a heading, not executing an impulsive orbital maneuver.
- Dogleg state: when the requested inclination lies outside the direct band, do not stop at an unreachable warning. Set the first reachable plane to the nearest band boundary (`abs(latitude)` prograde or `180deg - abs(latitude)` retrograde), solve and draw its valid rocket-relative launch heading, and calculate the ideal circular-orbit plane-change cost as `2 vOrbit sin(deltaInclination / 2)`. Keep the requested plane hot pink and add the first reachable plane in green. Rotate the shared dogleg view about `-17deg` so the node tangent reads as an oblique orbital direction rather than a false north/south arrow. The order must be unambiguous: label the green path `1 FIRST PLANE` and run its sole approved 16-segment tail into an orange craft tangent to that incoming orbit at the shared node; label the dashed hot-pink orbit `2 TARGET PLANE` but do not add a second tail into or away from the same craft. Project the maneuver vector from the actual change between the two screen-space tangent-velocity components at the node; for the standard shallow prograde view and a reduction from the latitude-floor plane to a flatter target, that projection points along the positive minor-axis direction, not decoratively outward and upward. Anchor the shortened hot-pink normal/anti-normal marker to the craft and label the requested inclination change and delta-v in the same hot pink. The two ellipses must meet at the node and diverge smoothly away from it—no disconnected rings, fake radial transfer, kinked orbital path, radial craft, arbitrary burn-arrow angle, or competing target-orbit tail. Readouts must expose the initial launch heading, first-plane inclination, and plane-change cost. This is a two-impulse teaching plan, not an optimized dogleg ascent or a claim that atmospheric steering losses are included.
- Velocity inset: draw a closed, directionally correct vector triangle on an east/north frame. Cyan `V SURFACE` runs east from the origin; hot-pink inertial `V ORBIT` runs from the same origin at the selected inertial-track azimuth; green `V ROCKET` connects the surface-vector tip to the orbital-vector tip. Preserve their relative lengths at the inset scale. In a dogleg state, replace the triangle with a compact two-step summary containing the first heading, inclination correction, and ideal plane-change delta-v. Reserve the no-direct-solution state for bodies with no launchable surface.
- Controls and readouts: switch between verified Kerbin launch-site presets and a custom surface base. Custom mode selects a body and signed latitude; a gas giant produces a no-surface state. Controls also select parking altitude, `0deg..180deg` target inclination, and northbound/southbound node. The primary and alternate headings are rocket-relative steering headings; do not expose the inertial-track azimuth under the ambiguous label `ideal heading`. Readouts also include direct-access status, local spin speed, along-track and cross-track components, circular speed, rocket-relative speed, rotational credit or penalty, and directly reachable inclination band.
- Forbidden: treating longitude as a larger or smaller speed boost; reporting total ascent delta-v; scalar-subtracting surface speed for non-eastward headings; drawing a direct launch below the latitude floor; depicting a dogleg as impossible without showing its reachable first plane and node burn; creating named non-Kerbin launch centers; providing a Jool surface base; using a maneuver glyph on a direct launch; pointing a craft radially; omitting the active-plane tail; drawing local east screen-left at the foreground node; clipping the foreground orbit or tail behind the planet; placing annotations on top of the near-side arc; or bending the azimuth vector into a fake ascent trajectory.

## Planner Family Cards

These three cards use `viewBox="0 0 320 190"` and no navball badge. They form one visual sequence: a local Hohmann transfer, the same transfer scaled to heliocentric space, then a deliberately alarming multi-body trajectory. All craft markers use the established orange chevron and remain tangent to the path beneath them.

### Single Planet Systems

- View: top-down local-system Hohmann transfer.
- Host body: teal planet at `(135, 95)`, `r=28`, occupying the left focus of the transfer ellipse.
- Current orbit: blue circle centered `(135, 95)`, `r=50`.
- Target orbit: blue dashed circle centered `(135, 95)`, `r=88`, fully contained inside the plotting field.
- Captured satellite: moon at the target-orbit arrival point `(223, 95)`, `r=9`.
- Transfer orbit: ellipse centered `(154, 95)`, `rx=69`, `ry=66.33`, with the host body at its left focus. Highlight only the upper transfer half from the inner-orbit departure `(85, 95)` to the outer-orbit arrival `(223, 95)` using `M 85 95 A 69 66.33 0 0 1 223 95`.
- Craft: `translate(188.50 37.55) rotate(29)`, at transfer-ellipse parameter `t=300deg`, nose tangent down and right toward arrival.
- Motion cue: 16 contiguous transfer-ellipse segments from `t=200deg` to `t=300deg`, using the approved `0.5→4.5px` and `0.04→0.98` taper and ending at the craft.
- Burn/result marks: orange prograde burn from `(85, 93)` to `(85, 65)` with its arrowhead seated at the endpoint; amber departure node at `(85,95)`. The burn is tangent to the inner orbit and starts at the transfer departure.
- Layering: orbits and transfer path; body and moon; motion cue and burn; craft last.
- Forbidden: placing the host at the transfer ellipse's center, detaching the tail from the ellipse, or implying the moon is the central body.

### Interplanetary Transfers

- View: top-down heliocentric Hohmann transfer, using the same geometry lesson at a larger scale.
- Sun: amber body at `(85, 98)`, `r=22`, occupying the left focus of the transfer ellipse.
- Origin orbit: blue circle centered `(85, 98)`, `r=60`; Kerbin sits at the left departure point `(25, 98)`, `r=8`.
- Destination orbit: faint amber circle centered `(85, 98)`, `r=120`; Duna sits at the right arrival point `(205, 98)`, `r=10`.
- Transfer orbit: ellipse centered `(115, 98)`, `rx=90`, `ry=84.85`, with the Sun at its left focus. Highlight the upper transfer half with `M 25 98 A 90 84.85 0 0 1 205 98`.
- Craft: `translate(166.62 28.49) rotate(33.5)`, at transfer-ellipse parameter `t=305deg`, tangent down and right toward Duna.
- Motion cue: 16 contiguous transfer-ellipse segments from `t=205deg` to `t=305deg`, using the approved shared taper and ending at the craft.
- Phase geometry: dashed spokes from the Sun to Kerbin and Duna; these explain the opposite-side phase relationship and remain visually subordinate to the orbits.
- Burn/result marks: orange departure burn at Kerbin, tangent upward from `(25, 96)` to `(25, 67)`; small amber departure and arrival nodes remain centered on their orbit intersections.
- Layering: reference orbits and phase spokes; transfer path; Sun and planets; motion cue and burn; craft last.
- Forbidden: centering the transfer ellipse on the Sun, letting the outer orbit obscure Duna, or detaching the motion cue from the conic.

### Advanced Maneuvers

- View: top-down multi-body low-energy/resonant trajectory with intentionally escalating complexity.
- Primary: teal planet at `(160, 102)`, `r=25`, with a faint hot-pink atmosphere warning ring at `r=32`.
- Assist bodies: left moon at `(70, 139)`, `r=9`; upper-right moon at `(258, 52)`, `r=11`.
- Reference geometry: two faint dashed resonance ellipses centered on the primary—`rx=96`, `ry=52`, `rotate(-12 160 102)` and `rx=126`, `ry=76`, `rotate(20 160 102)`. Do not add primary-to-moon spokes or other orthogonal construction lines.
- Maneuver path: one continuous Catmull-Rom-derived cubic spline with exact path `M 18 154 C 22.17 153.83 36.33 154 43 153 C 49.67 152 53.67 148 58 148 C 62.33 148 64.83 153 69 153 C 73.17 153 79.67 150.67 83 148 C 86.33 145.33 88.67 140.67 89 137 C 89.33 133.33 83.83 128.83 85 126 C 86.17 123.17 91.5 120 96 120 C 100.5 120 107.17 122.83 112 126 C 116.83 129.17 117 134.17 125 139 C 133 143.83 148.5 157.5 160 155 C 171.5 152.5 185.83 133.17 194 124 C 202.17 114.83 207.5 108.33 209 100 C 210.5 91.67 207.33 81.67 203 74 C 198.67 66.33 191 58.33 183 54 C 175 49.67 164 47 155 48 C 146 49 136 54 129 60 C 122 66 116 75.83 113 84 C 110 92.17 109.33 101 111 109 C 112.67 117 117 126 123 132 C 129 138 138.5 143.17 147 145 C 155.5 146.83 166.33 145.5 174 143 C 181.67 140.5 189.83 135 193 130 C 196.17 125 190 119.83 193 113 C 196 106.17 205 95.83 211 89 C 217 82.17 224.17 77.17 229 72 C 233.83 66.83 236.83 63 240 58 C 243.17 53 244.17 45.83 248 42 C 251.83 38.17 258 34.83 263 35 C 268 35.17 274 39.17 278 43 C 282 46.83 286 53 287 58 C 288 63 286.17 68.33 284 73 C 281.83 77.67 278 82.67 274 86 C 270 89.33 264.33 92.33 260 93 C 255.67 93.67 249.67 88.17 248 90 C 246.33 91.83 247 99.33 250 104 C 253 108.67 258.67 114 266 118 C 273.33 122 289.33 126.33 294 128`.
- Spline mechanics: all `37` cubic joins are tangent-continuous. The trajectory clears the left moon by approximately `4.1` viewBox units, the upper moon by `3.1`, and the primary surface by `9.8`; its closest primary pass remains only `2.8` units outside the `r=32` atmosphere warning ring.
- Path meaning: inbound left-moon flyby, low primary pass, one complete resonant loop around the primary, second close primary pass, upper-moon flyby, and lower-right escape. The path may be silly, but it does not orbit-kink, intersect a body, or loop a moon as though captured.
- Craft: `translate(193 113) rotate(-59)`, on the second close primary pass, nose tangent up and right toward the upper moon. Draw it above the body and trajectory.
- Panic marks: hot-pink close-pass node at `(193,113)` and terminal amber arrowhead seated at `(294,128)`. The atmosphere ring communicates the narrow margin. Gravity assists are unpowered, so do not add burn ticks at either moon.
- Layering: reference ellipses and full trajectory; assist bodies and primary; foreground close-pass stroke; close-pass node; craft last.
- Forbidden: disconnected decorative squiggles, path segments that do not join, a craft off the trajectory, or a glow heavy enough to hide the path.

## Glossary Orbit Cards

### Apoapsis

- View: top-down elliptical orbit view.
- Current geometry: blue ellipse `cx=160`, `cy=105`, `rx=112`, `ry=92`.
- Body: left focus at `cx=97`, `cy=105`, `r=34`.
- Apoapsis node: right vertex at `cx=272`, `cy=105`, `r=5`.
- Craft: `translate(252 52) rotate(50)`, on the ellipse near `t=-35deg`, nose tangent in the direction of travel.
- Motion cue: 16 short arc segments on the same ellipse from about `t=-135deg` to `t=-35deg`; segment stroke grows gradually toward the craft so the cue is thinnest far behind and thickest at the exhaust-nozzle side.
- Labels: `Apoapsis` at `x=222`, `y=136`; `100,000 m` at `x=226`, `y=154`.
- Forbidden: any detached tail, left-to-right gradient standing in for orbital direction, or craft rotation that is not tangent to the ellipse.

### Periapsis

- View: top-down elliptical orbit view.
- Current geometry: blue ellipse `cx=160`, `cy=105`, `rx=112`, `ry=92`.
- Body: left focus at `cx=97`, `cy=105`, `r=34`.
- Periapsis node: left vertex at `cx=48`, `cy=105`, `r=5`, clearing the body.
- Craft: `translate(68 158) rotate(-131)`, on the ellipse near `t=145deg`, nose tangent in the direction of travel.
- Motion cue: 16 short arc segments on the same ellipse from about `t=45deg` to `t=145deg`; segment stroke grows gradually toward the craft so the cue is thinnest far behind and thickest at the exhaust-nozzle side.
- Labels: `Periapsis` at `x=24`, `y=54`; `15,000 m` at `x=24`, `y=72`.
- Forbidden: any detached tail, left-to-right gradient standing in for orbital direction, or craft rotation that is not tangent to the ellipse.

## Burn Direction Cards

These cards use KSP navball marker colors for the burn/result/delta color family. Do not substitute generic accent colors.

### Prograde

- View: top-down orbit view.
- Marker badge: shared badge `x=18..98`, `y=124..194`.
- Current orbit: blue circle `cx=171`, `cy=104`, `r=62`.
- Delta orbit: green dashed ellipse `cx=198`, `cy=104`, `rx=89`, `ry=85`.
- Body: `cx=171`, `cy=104`, `r=27`.
- Craft: `translate(109 104) rotate(-90)`, on left side of current orbit, nose up.
- Burn vector: `x1=109`, `y1=102.5`, `x2=109`, `y2=46.15`; tangent up, anchored to the transformed center of the craft glyph.
- Result vector: `x1=233`, `y1=104`, `x2=287`, `y2=104`; points outward to raised far side.
- Motion cue: 16 short arc segments on the current blue circle from about `t=80deg` to `t=180deg`; use the approved shared orbital-tail taper, thinnest far behind and thickest where the tail meets the craft.
- Forbidden: blue tail detached from the orbit, broad path strokes, result color that is not prograde green.

### Retrograde

- View: top-down orbit view.
- Marker badge: bottom-left shared badge.
- Orbital system placement: wrap the reference orbit, motion cue, delta orbit, body, result vector, burn vector, and craft in a single `transform="translate(24 0)"` group. Preserve every internal coordinate. This moves the leftmost orbit/result edge from `x=83` to `x=107`, leaving `9` viewBox units of clearance after the badge edge at `x=98`.
- Must literally reverse prograde's role logic.
- Current orbit: larger blue ellipse `cx=172`, `cy=104`, `rx=89`, `ry=85`.
- Delta orbit: smaller green dashed circle `cx=199`, `cy=104`, `r=62`.
- Body: `cx=199`, `cy=104`, `r=27`.
- Craft: `translate(261 104) rotate(90)`, on right side of current orbit, nose down.
- Burn vector: `x1=261`, `y1=105.5`, `x2=261`, `y2=49.15`; tangent/reversed, anchored to the transformed center of the craft glyph and same length as prograde.
- Result vector: `x1=83`, `y1=104`, `x2=137`, `y2=104`; horizontal, same 54px length as the prograde result arrow, from the left side of the original blue orbit toward the smaller green orbit, with a blue-to-green stroke.
- Motion cue: 16 short arc segments on the current blue ellipse from about `t=-100deg` to `t=0deg`; use the approved shared orbital-tail taper, thinnest far behind and thickest where the tail meets the craft.
- Forbidden: crowding the marker badge, putting the craft on the marker side, making the arrow unreadable.

### Radial Out

- View: top-down orbit view.
- Marker badge: bottom-left shared badge.
- Current orbit: blue circle `cx=190`, `cy=120`, `r=66`.
- Delta orbit: cyan dashed east-shifted ellipse `cx=214`, `cy=120`, `rx=72`, `ry=70`; it shares the craft/burn point at `(190, 54)`.
- Body: `cx=190`, `cy=120`, `r=27`.
- Craft: `translate(190 54) rotate(0)`, on top of current orbit.
- Burn vector: `x1=191.5`, `y1=54`, `x2=191.5`, `y2=19.5`; radial out, away from body, anchored to the transformed center of the craft glyph and the same `34.5`-unit length as radial in.
- Result vector: `x1=256`, `y1=120`, `x2=286`, `y2=120`; a 30-unit horizontal arrow on the right ecliptic, starting at the current circle and terminating at the east-shifted delta orbit, pointing right to show outward orbital translation.
- Radial guide: `x1=190`, `y1=120`, `x2=190`, `y2=54`.
- Motion cue: 16 short arc segments on the current blue circle from about `t=-190deg` to `t=-90deg`; use the approved shared orbital-tail taper, thinnest far behind and thickest where the tail meets the craft.
- Forbidden: deleting the delta orbit, drawing a prograde-style far-side altitude raise.

### Radial In

- View: top-down orbit view.
- Marker badge: bottom-left shared badge.
- Orbital system placement: wrap the current orbit, motion cue, delta orbit, result vector, radial guide, body, burn vector, and craft in a single `transform="translate(12 0)"` group. Preserve every internal coordinate. This moves the leftmost delta-orbit edge from `x=94` to `x=106`, leaving `8` viewBox units of clearance after the badge edge at `x=98`.
- Current orbit: blue circle `cx=190`, `cy=120`, `r=66`.
- Delta orbit: cyan dashed west-shifted ellipse `cx=166`, `cy=120`, `rx=72`, `ry=70`; it shares the craft/burn point at `(190, 54)`.
- Body: `cx=190`, `cy=120`, `r=27`.
- Craft: `translate(190 54) rotate(0)`, on top of current orbit.
- Burn vector: `x1=191.5`, `y1=54`, `x2=191.5`, `y2=88.5`; radial in, toward body, anchored to the transformed center of the craft glyph.
- Result vector: `x1=124`, `y1=120`, `x2=94`, `y2=120`; a 30-unit horizontal arrow on the left ecliptic, starting at the current circle and terminating at the west-shifted delta orbit, pointing left to show inward orbital translation. It remains inside the shared `translate(12 0)` orbital-system group.
- Radial guide: `x1=190`, `y1=120`, `x2=190`, `y2=54`.
- Motion cue: 16 short arc segments on the current blue circle from about `t=-190deg` to `t=-90deg`; use the approved shared orbital-tail taper, thinnest far behind and thickest where the tail meets the craft.
- Forbidden: deleting the delta orbit, drawing a prograde-style far-side altitude lower.

### Normal

- View: equatorial edge-on view, tilted only enough to read the orbit as a shallow Saturn-like ring.
- Marker badge: bottom-left shared badge.
- Orbital system placement: wrap the original orbit, target orbit, body, foreground connection, motion cue, both translation vectors, burn vector, and craft in a single `transform="translate(18 0)"` group. Preserve all internal coordinates. The left translation curve's outward extreme moves from about `x=87.4` to `x=105.4`, leaving roughly `7.4` viewBox units beyond the badge edge at `x=98`; the rightmost geometry remains inside the `320`-unit viewBox.
- Original orbit: full blue ellipse `cx=190`, `cy=108`, `rx=94`, `ry=6`, matching the shallow horizontal target-orbit proportion already established on anti-normal.
- Target orbit: same-size hot-pink dashed ellipse `cx=190`, `cy=108`, `rx=94`, `ry=6`, with `transform="rotate(-30 190 114)"`. Use the normal icon's exact hot pink, `#ff18b0`. The transform pivots around the ship/node, inclining the right side by `30deg`, declining the left side by `30deg`, and keeping the target orbit intersected with the original at `(190, 114)`. Draw the full ellipse before the planet as the rear layer, then redraw only its local lower/front half after the planet with `M 284 108 A 94 6 0 0 1 96 108` and the same rotation. This hides the upper/rear arm behind the body while preserving the lower arm in front.
- Body: `cx=190`, `cy=108`, `r=27`, centered inside the ring.
- Craft: `translate(190 114) rotate(0)`, centered on the foreground midpoint of the original orbit and facing right along the tangent.
- Burn vector: `x1=190`, `y1=112.5`, `x2=190`, `y2=56.1`; a solid `#ff18b0` arrow anchored beneath the ship and pointing due north. Its `56.4`-unit stem is exactly `20%` shorter than the prior `70.5`-unit stem. Use the dedicated `normal-burn-arrow` marker with `refX=8` so the stem endpoint is buried inside the arrowhead instead of aliasing as a terminal dot.
- Left translation vector: `M 96 108 C 83 120 83 142 105.59 155.80`; a smooth outward-bowing blue-to-hot-pink curve from the original orbit's extreme left point to the rotated target orbit's extreme left point. Both control points pull the curve away from the planet while the final handle continues the visible sweep into the endpoint without a terminal hook.
- Right translation vector: `M 284 108 C 297 96 297 78 268.41 61.80`; the mirrored outward bow from the original orbit's extreme right point to the rotated target orbit's extreme right point.
- Translation-vector arrowheads: `#ff18b0`, with their tips terminating exactly on the target-orbit endpoints and `orient="auto"` following each terminal Bezier tangent. The arrowhead axis must be collinear with its stem, making the flat back edge perpendicular to the stem. Do not rotate the arrowhead to the target orbit. Use butt caps on all normal vector stems so no round terminal dot shows through the arrowheads. The outward curved stems communicate rotation around the ship node rather than linear displacement.
- Foreground orbit connection: `M 284 108 A 94 6 0 0 1 202 113.95`; redraw the lower-right quadrant over the body from the orbit's right edge to the transformed craft nose at approximately `(202, 114)`.
- Motion cue: 16 short arc segments on the original ellipse from about `t=190deg` to `t=90deg`; use the approved shared orbital-tail taper, thinnest far behind and thickest where it meets the craft.
- Layering: draw the full original orbit and full dashed target orbit behind the body; draw the planet and shine; redraw the original lower-right foreground connection and the target orbit's local lower/front half over the body; then draw the orbital tail, both translation vectors, and burn vector. Draw the craft last so it sits above both orbits and every vector at their shared node.
- Current build stage: original orbit, target orbit, body, craft, motion cue, burn vector, and paired translation vectors only.
- Forbidden: changing either orbit's `94×6` proportions, rotating around the planet instead of the ship, an off-center craft, a flat axis line, or allowing either orbit to cover the craft.

### Anti-normal

- View: the exact edge-on Saturn-ring convention used by normal, with current and target roles reversed.
- Marker badge: bottom-left shared badge.
- Orbital system placement: wrap both orbits, the body, foreground orbit halves, orbital tail, both translation vectors, burn vector, and craft in a single `transform="translate(18 0)"` group. Preserve the internal normal-card coordinate system and keep the badge fixed.
- Original/current orbit: blue shallow ellipse `cx=190`, `cy=108`, `rx=94`, `ry=6`, with `transform="rotate(-30 190 114)"`. It is the normal target orbit reassigned as anti-normal's current inclined orbit.
- Target orbit: horizontal hot-pink dashed ellipse `cx=190`, `cy=108`, `rx=94`, `ry=6`, using the anti-normal icon's exact `#ff18b0`. It is the normal current orbit reassigned as anti-normal's target midline.
- Orbit depth: draw both full ellipses before the body. After the body, redraw each local lower/front half with `M 284 108 A 94 6 0 0 1 96 108`; apply `rotate(-30 190 114)` only to the blue current-orbit foreground half. Both upper/rear arms disappear behind the planet.
- Body: `cx=190`, `cy=108`, `r=27`, identical to normal.
- Craft: `translate(190 114) rotate(-30)`, centered on the shared foreground node, tangent to the inclined current orbit, nose pointing up and right, and drawn last.
- Burn vector: `x1=190`, `y1=115.5`, `x2=190`, `y2=171.9`; a solid hot-pink `#ff18b0` arrow pointing due south. Its `56.4`-unit stem is the exact vertical mirror of normal's northbound burn around the ship node at `y=114`.
- Left translation vector: `M 105.59 155.80 C 83 142 83 120 96 108`; the normal left translation curve reversed, starting on the inclined current orbit and terminating on the horizontal target midline.
- Right translation vector: `M 268.41 61.80 C 297 78 297 96 284 108`; the normal right translation curve reversed, starting on the inclined current orbit and terminating on the horizontal target midline.
- Translation-vector arrowheads: use the exact normal marker construction—`viewBox="0 0 10 10"`, `refX="10"`, `refY="5"`, `markerWidth="5"`, `markerHeight="5"`, `orient="auto"`, and triangle `M 0 0 L 10 5 L 0 10 z`—filled hot pink `#ff18b0`. Seat their tips exactly on the target-orbit endpoints. Each arrowhead axis follows its terminal stem tangent and its flat back edge remains perpendicular to the stem.
- Motion cue: 16 short arc segments on the inclined blue current orbit. Reuse normal's local current-ellipse tail from about `t=190deg` to `t=90deg`, then apply the same `rotate(-30 190 114)` transform as the current orbit. The final segment terminates at the craft node and the approved shared taper runs from `0.5px`/`0.04` to `4.5px`/`0.98`.
- Layering: full current and target ellipses; planet and shine; current and target foreground halves; rotated orbital tail; both translation vectors; south burn; craft last.
- Forbidden: pointing translation arrows toward the inclined poles, treating the horizontal midline as current, changing the shared `94×6` orbit proportions, moving the craft off the shared node, or crowding the marker badge.

## Additional Definition Cards

These glossary cards use the standard `0 0 320 210` viewBox without navball badges. They extend the same technical-drawing language with explicit vector, plane, conic, and patched-conic constructions.

### Orbit Hero

- Layout role: full-width glossary hero with the technical SVG occupying the left two column units and the narrative title/copy occupying the right column unit. The taller SVG grows with the lengthened copy. On narrow screens, stack the complete SVG above the copy.
- ViewBox: `0 0 560 460`.
- View: top-down teaching sequence from surface launch through orbital insertion and circularization, followed by a hot-pink outbound transfer, a yellow close lunar gravity brake, a purple free return, and a separate white atmospheric re-entry patch.
- Primary body: teal planet `cx=180`, `cy=255`, `r=48`, with shine at `(164,238)`, `r=10`.
- Secondary body: desaturated teal-gray Moon `cx=445`, `cy=210`, `r=24`, with shine at `(437,202)`, `r=6`.
- Launch trajectory: amber dotted cubic `M 180 303 C 180 360 88 335 88 255`. It begins at the due-south surface point `(180,303)`, leaves along the local vertical, follows a shallow, balanced parabolic sweep below and left of the planet, remains fully inside the insertion ellipse, and ends at insertion node `A=(88,255)` with an exact northbound tangent.
- Insertion trajectory: cyan dotted ellipse `cx=205`, `cy=255`, `rx=117`, `ry=114.29`. The planet is its left focus because `sqrt(117^2 - 114.29^2)` is approximately `25`, and `205 - 25 = 180`. Node `A=(88,255)` is periapsis; circularization node `B=(322,255)` is apoapsis.
- Circularized trajectory: green dotted circle `cx=180`, `cy=255`, `r=142`. It is tangent to the insertion ellipse at shared node `B=(322,255)` and carries a final coast craft at `C=(180,113)` to show the completed orbit.
- Surface-launch craft: `translate(180 303) rotate(90)`, located at the exact due-south surface point and tangent to the first launch control point. Its amber burn runs from `(180,316)` to `(180,350)` and creates the amber launch segment.
- Insertion craft: `translate(88 255) rotate(-90)`. Its cyan burn runs from `(88,242)` to `(88,198)` and creates the cyan insertion ellipse.
- Circularization craft: `translate(322 255) rotate(90)`. Its green burn runs from `(322,268)` to `(322,312)` and creates the green circular orbit.
- Trans-lunar craft: `translate(180 113) rotate(0)`, tangent to the completed circular orbit. Its yellow burn runs from `(194,113)` to `(232,113)` and creates the transfer segment.
- Lunar transfer: hot-pink dotted path `M 180 113 C 260 113 321.25 146 365 179`. It is the first half of the single underlying cubic `M 180 113 C 340 113 425 245 445 245`, split at `t=0.5` by de Casteljau subdivision. It leaves the completed circular orbit with an exact rightward tangent, remains outside the green parking circle, and ends at the Moon-dominance intercept craft `(365,179)` without an elbow or curvature reset.
- Gravity brake: yellow dotted path `M 365 179 C 408.75 212 435 245 445 245 A 35 35 0 0 0 469.75 185.25`. The first cubic is the second half of the same subdivided transfer cubic, so position, tangent, and curvature are mathematically continuous at the hot-pink/yellow handoff. It eases into an exact rightward tangent at lunar-flyby entry `(445,245)`, matching the `r=35` Moon-centered arc, and ends at the yellow-to-purple patch craft `(469.75,185.25)`. The Moon's `r=24` surface retains `11` viewBox units of closest-altitude clearance.
- Free return: purple dotted path `M 469.75 185.25 A 35 35 0 0 0 414.69 192.5 C 347.46 308.94 285.35 330 240 330`. It continues on the same `r=35` lunar circle across the upper-left flyby, then leaves the Moon on the arc's exact terminal tangent and sweeps down-left as one broad, monotonic return curve. The cubic stays outside the planet and flattens into a leftward tangent at the purple-to-white patch `(240,330)`. The yellow-to-purple patch at `(469.75,185.25)` remains an unpowered phase-color handoff.
- Atmospheric re-entry: white dotted path `M 240 330 C 194.65 330 166.06 308.94 146.06 288.94`. It begins with the same leftward tangent as the purple return, tightens continuously toward the planet, and meets the lower-left surface near `135deg` with an exact local surface tangent. The purple and white cubics share both tangent vector `(-45.35,0)` and second-difference vector `(16.76,-21.06)` at their patch, removing every reversal, kink, and chicane while preserving the different phase colors.
- Lunar/intercept craft snapshots: place the transfer intercept craft at `translate(365 179) rotate(37.03)`, tangent to the shared subdivided cubic at the exact hot-pink/yellow handoff. Preserve `translate(445 245) rotate(0)` at the flyby bottom, `translate(480 210) rotate(-90)` at the flyby right, `translate(469.75 185.25) rotate(-135)` at the transfer/free-return color patch, and `translate(414.69 192.5) rotate(120)` on the purple free-return tail. None carries a burn vector because the lunar brake is unpowered.
- Gravity vectors: retain three Earth-pointing cues at launch `(180,290)→(180,276)`, insertion `(101,255)→(130,255)`, and trans-lunar departure `(180,126)→(180,185)`. Remove the gravity vector from the hot-pink intercept craft. Preserve the Moon-pointing vector attached to the purple free-return craft: draw it beneath the craft from its center `(414.69,192.5)` to the Moon's upper-left surface `(424.22,198.0)`, so the overlaid craft hides the stem origin and the arrow tip stops exactly at the body boundary. Keep right limb `(479,210)→(469,210)` and lower limb `(445,244)→(445,234)`. The free-return `g` may sit over the Moon's upper-left quadrant.
- Directional tails: every base trajectory remains dotted. Overlay exactly 16 contiguous approved tail segments in each of seven visible phases: launch, insertion, circular orbit, hot-pink transfer, yellow gravity brake, purple free return, and white atmospheric re-entry. The hot-pink transfer tail samples its revised cubic from `t=0.12` through `t=1.00` and ends at intercept `(365,179)`. The yellow gravity-brake tail runs around the Moon-centered arc from `(445,245)` through the right limb to `(469.75,185.25)`, ending at the pre-free-return craft. Preserve the purple lunar-arc tail unchanged. Resample the white re-entry cubic into 16 contiguous segments from patch `(240,330)` through surface contact `(146.06,288.94)`. All seven tails use the shared `0.5px`/`0.04` to `4.5px`/`0.98` progression, for `112` hero tail segments total.
- Labels: use `1 LAUNCH`, `2 INSERT`, `3 CIRCULARIZE`, `4 TRANSFER`, `5 GRAVITY BRAKE`, `6 FREE RETURN`, and `7 RE-ENTRY`. Place `4 TRANSFER` at `(210,96)`, directly above and close to its burn arrow. Center hot-pink `INTERCEPT` at `(365,147)`, above the intercept craft. Place `5 GRAVITY BRAKE` in the Moon's southeast quadrant between the south-pole and east-equator craft at `(488,268)` with centered alignment. Place `6 FREE RETURN` at `(350,295)`, adjacent to but clear of the rebuilt purple trajectory and still above `3 CIRCULARIZE`. Keep `7 RE-ENTRY` at `(215,352)`, below its white arc. Keep body identifiers and small amber `g` labels subordinate.
- Color mapping: launch uses amber `#f5b447`; insertion uses cyan `#5bd7eb`; circularized orbit uses green `#8ce66f`; lunar transfer, its burn, tail, label, and intercept use icon hot pink `#ff18b0`; free return uses purple `#a96bff`; atmospheric re-entry uses white-blue `#d9f2f7`; all gravity vectors use amber; every craft uses the established orange chevron.
- Layering: seven dotted trajectory phases; planet and Moon; surface-emergent launch path; seven colored directional tails; all gravity and burn vectors; nine craft snapshots; labels last.
- Forbidden marks: solid base trajectories, body intersections, corners or tangent discontinuities at patched-conic joins, a burn tick at the unpowered lunar flyby, gravity arrows pointed away from their active center, mismatched burn/next-segment colors, a focus-incorrect insertion ellipse, a circularization circle that misses node `B`, or decorative stars.
- Card-size render notes: preserve the full `560×460` scene at every breakpoint. All seven trajectory phases must remain separable, the Moon must stay visually secondary to the planet, and labels, arrows, and nine craft snapshots must remain individually legible at desktop and distinguishable at mobile card size.

### Delta-v

- View: top-down local orbit with a velocity-vector addition triangle at the craft.
- Marker badge reservation: none; the left half is reserved for the local orbit and the right half for the vector construction.
- Current geometry: blue circle `cx=80`, `cy=110`, `r=58`.
- Delta geometry: green dotted osculating ellipse `cx=114.00`, `cy=113.06`, `rx=75.72`, `ry=67.63`, rotated `5.15deg` around its center. It passes through the burn point `(80,52)`, is tangent there to `v2`, has the planet at its left focus to rounding, and extends the far side to approximately `r=109.9` from the planet versus the original `r=58`.
- Body/focus geometry: teal body `cx=80`, `cy=110`, `r=29` with a shine at `(70,100)`, `r=7`.
- Craft position: `translate(80 52)` at the top of the current circle.
- Craft rotation: `0deg`, nose pointing right along the positive tangent.
- Current velocity vector: cyan line from `(94,52)` to `(176,52)`.
- Result velocity vector: green line from `(94,52)` to `(177.64,15.92)`. In current-circular-speed units it represents `v_t=1.02` and outward radial speed `v_r=0.44`, producing a clearly readable `23.34deg` flight-path angle.
- Delta-v vector: amber line from the tip of `v1` at `(176,52)` to the tip of `v2` at `(177.64,15.92)`, closing the vector-addition triangle. Its magnitude is `36.12` display units, or `0.44` of the `82`-unit circular-speed vector.
- Orbit derivation: with normalized `r=1`, `mu=1`, and `v=(1.02,0.44)`, the post-burn ellipse has `a=1.3055r`, `e=0.4506`, `rp=0.7172r`, and `ra=1.8938r`. Scaling by the displayed `r=58` gives `a=75.72`, `b=67.63`, and the stated center/rotation. The new periapsis remains about `12.6` viewBox units above the `r=29` body surface.
- Motion cue: 16 contiguous current-orbit segments from `t=170deg` to `t=270deg`, ending at the craft and using the approved orbital-tail taper.
- Labels: `v1` above the cyan vector, `v2` above the green vector, and `Δv` beside the amber joining vector.
- Color mapping: reference orbit and `v1` use cyan; `v2` uses marker green `#8ce66f`; `delta-v` uses amber `#f5b447`; craft uses the established orange chevron.
- Layering: reference orbit and dotted delta orbit; body and shine; motion cue; vector triangle; craft and labels last.
- Forbidden marks: fuel gauges, disconnected arrows, vectors that do not share exact endpoints, a changed orbit that misses the burn point, or an ellipse whose tangent disagrees with `v2`.
- Card-size render notes: keep all three arrowheads and labels above `y=62`; the vector triangle must remain visually separate from the body, and the delta orbit must stay within the `320×210` plotting field.

### Inclination

- View: equatorial edge-on plane comparison, using the established shallow Saturn-ring convention.
- Marker badge reservation: none; the full plotting field is available.
- Current/original geometry: cyan equatorial ellipse `cx=160`, `cy=105`, `rx=105`, `ry=14` plus a faint reference ray from `(160,105)` to `(246,105)`.
- Comparison geometry: hot-pink orbit with the same `105×14` ellipse, rotated `-28deg` around the body center `(160,105)`, plus a faint plane ray from `(160,105)` to `(235.93,64.63)`.
- Delta geometry: no maneuver or target orbit; this card measures the static angular separation between the original equatorial plane and the inclined comparison plane.
- Body/focus geometry: teal body `cx=160`, `cy=105`, `r=28`, with shine at `(151,95)`, `r=7`.
- Craft position: `translate(160 119)` at the foreground midpoint of the cyan original ellipse.
- Craft rotation: `0deg`, nose pointing right along the original-orbit tangent. This avoids placing the craft at a perspective-compressed side vertex where the local tangent appears to point orthogonally into deep space.
- Burn vector: none.
- Result vector: none.
- Inclination measure: amber circular arc of radius `73` from `(233,105)` to `(224.46,70.73)`, labeled `i = 28°`; this angle is measured between the two plane rays.
- Motion cue: 16 contiguous segments on the cyan original `105×14` ellipse from `t=190deg` down to `t=90deg`, ending at the foreground craft and using the approved taper without a rotation transform.
- Depth layering: draw both complete ellipses and both plane rays behind the body; draw the body; redraw each lower/front half with `M 265 105 A 105 14 0 0 1 55 105`, applying the `-28deg` transform only to the current orbit; draw the angle, tail, and craft above those layers.
- Labels: `EQUATOR` beside the horizontal ray and `ORBIT` beside the inclined ray, with colors matching their geometry.
- Color mapping: original equatorial orbit and its tail use cyan; inclined comparison orbit uses exact hot pink `#ff18b0`; angle and value use amber; craft uses the established orange chevron.
- Forbidden marks: concentric top-down circles, orbit planes that do not share the same center, a plane-change burn arrow, or rear orbit arms drawn over the body.
- Card-size render notes: keep the angle wedge outside the body and the `ORBIT` label clear of the craft.

### Transfer Orbit

- View: top-down local Hohmann transfer between two circular orbits.
- Marker badge reservation: none.
- Current geometry: cyan parking circle `cx=115`, `cy=110`, `r=47`.
- Delta geometry: cyan dashed target circle `cx=115`, `cy=110`, `r=88`.
- Transfer geometry: amber ellipse centered `(94.5,110)`, `rx=67.5`, `ry=64.3`. Its strong upper half runs from the inner-orbit departure `(162,110)` to the outer-orbit arrival `(27,110)`. The primary at `(115,110)` is the ellipse's right focus, because `sqrt(67.5^2 - 64.3^2)` is approximately `20.5`.
- Un-circularized return: complete the lower half from burn `2` at `(27,110)` back toward burn `1` at `(162,110)` with 16 contiguous amber arc segments spanning `t=-180deg` through `t=-360deg`. Keep the stroke geometry on the same transfer ellipse and fade opacity progressively from `0.70` at burn `2` to `0.035` approaching burn `1`. This shows the offset ellipse the craft will continue following if burn `2` is skipped; it is not a second trajectory or a decorative loop.
- Body/focus geometry: teal primary `cx=115`, `cy=110`, `r=28`, with shine at `(106,100)`, `r=7`.
- Craft position: `translate(71.41 49.58)`, on the transfer ellipse at `t=-110deg`.
- Craft rotation: `160.9deg`, tangent down and left toward outer-orbit arrival.
- Burn vector: departure burn from `(162,108)` to `(162,75)`, tangent upward at the inner-orbit right vertex; arrival circularization burn from `(27,112)` to `(27,145)`, tangent downward at the outer-orbit left vertex.
- Result vector: none; the complete transfer conic itself is the result, with the faded return half communicating the failure-to-circularize case.
- Motion cue: 16 contiguous transfer-ellipse segments from `t=-10deg` down to `t=-110deg`, ending at the craft and using the approved taper in amber.
- Nodes: amber departure node at `(162,110)`, arrival node at `(27,110)`, each `r=3.5`.
- Labels: compact amber `1` and `2` labels beside departure and arrival burns; `TRANSFER` follows the empty upper-right area without crossing the craft.
- Color mapping: circular reference orbits use cyan; target orbit is dashed; transfer path and transfer tail use amber; burns and craft use established orange.
- Layering: circular orbits, faded lower return, and strong upper transfer half; body and shine; nodes and burn vectors; transfer tail; craft and labels last.
- Forbidden marks: a transfer ellipse centered on the body, a return path that does not join burns `2` and `1` on the same ellipse, a path that is not tangent at both nodes, arrows pointing radially, or a transfer path passing through the body.
- Card-size render notes: outer orbit remains inside `x=27..203`, leaving the right side as negative space for the transfer label; neither burn arrow clips the frame.

### Sphere of Influence

- View: top-down patched-conic handoff from a parent-dominated region into and back out of a moon's sphere of influence.
- Marker badge reservation: none.
- Current geometry: faint cyan moon-orbit arc centered on the parent at `(66,106)` with `r=159`, passing through the moon at `(225,106)`.
- Delta geometry: one tangent-continuous trajectory split only for color at the SOI crossings. Inbound parent-centric segment: `M 18 160 C 75 155 125 145 167.36 127.85`. Moon-centric segment: `M 167.36 127.85 C 190 118.69 184 82 213 70 C 244 57 272 87 262 116 C 258 130 266 138 274 143`. Outbound parent-centric segment: `M 274 143 C 285 150 294 160 306 174`.
- Body/focus geometry: teal parent `cx=66`, `cy=106`, `r=26`; gray-green moon `cx=225`, `cy=105`, `r=16`; dashed amber SOI boundary `cx=225`, `cy=105`, `r=62`.
- Craft position: `translate(167.36 127.85)` exactly on the inbound SOI crossing.
- Craft rotation: `-22deg`, matching the shared terminal/start tangent of the inbound and moon-centric cubic segments.
- Burn vector: none; an SOI crossing does not itself require a burn.
- Result vector: none; the smoothly curving patched conic communicates the gravity handoff.
- Motion cue: none. The split trajectory colors and tangent-aligned craft provide direction without adding a generic tail to a non-orbital transit line.
- Color mapping: parent-centric path and moon reference orbit use cyan; moon-centric path and SOI boundary use amber; craft uses established orange.
- Continuity and clearance: entry tangents `(42.36,-17.15)` and `(22.64,-9.16)` are collinear to rounding; exit tangents `(8,5)` and `(11,7)` are collinear to rounding. The moon-centric curve stays outside the moon's `r=16` body.
- Labels: `SOI` sits inside the boundary near its upper-right edge; `PARENT` labels the teal primary without crossing the trajectory.
- Layering: parent orbit and SOI boundary; full trajectory; parent and moon bodies; crossing node; craft and labels last.
- Forbidden marks: a hard trajectory kink at the SOI boundary, a burn arrow at either crossing, a path through either body, gravity-force rays, or rendering the SOI as a solid physical shell.
- Card-size render notes: the SOI circle remains fully inside the frame at `x=163..287`, `y=43..167`; the escape endpoint at `(306,174)` leaves arrowhead-free edge clearance.

### Thrust-to-weight Ratio

- View: side-on launch force diagram immediately above a curved planetary horizon.
- Marker badge reservation: none.
- Current geometry: vertical launch stack centered at `x=160`, spanning nose `y=64` through engine bell `y=145`; curved teal body is a circle `cx=160`, `cy=288`, `r=140`, placing the surface horizon at `y=148`.
- Delta geometry: none; this is a static force comparison at the instant before liftoff.
- Body/focus geometry: planet gradient fills the lower horizon; the vehicle center of mass is represented by a small amber node at `(160,104)`.
- Craft position: custom vertical launch-stack component centered on `(160,105)` with nose cone, body, fins, and engine bell.
- Craft rotation: vertical, nose up.
- Thrust vector: green arrow at `x=128` from `(128,141)` to `(128,60)`, length `81`.
- Weight vector: amber arrow at `x=192` from `(192,82)` to `(192,147)`, length `65`.
- Ratio: the displayed vector-length ratio is `81/65 = 1.246`, labeled `T/W = 1.25`; it communicates a craft whose available thrust exceeds local weight without pretending to include drag or steering losses.
- Motion cue: none.
- Labels: `THRUST` beside the upward vector, `WEIGHT` beside the downward vector, and `T/W = 1.25` in the upper-right plotting area.
- Color mapping: thrust uses marker green `#8ce66f`; weight and ratio use amber; craft outline and engine use the established orange/cyan technical palette.
- Layering: planet horizon; force vectors; launch stack; center-of-mass node and labels last.
- Forbidden marks: an orbit, a velocity vector, a thrust arrow shorter than the weight arrow for the displayed ratio, or copy implying that `T/W > 1` guarantees an efficient ascent.
- Card-size render notes: keep both arrowheads clear of the frame and keep the engine bell visibly above the horizon.

### Specific Impulse (Isp)

- View: side-by-side engine-efficiency comparison at equal thrust and equal elapsed burn time.
- Marker badge reservation: none.
- Current geometry: low-Isp engine column centered at `x=96`; high-Isp engine column centered at `x=224`.
- Delta geometry: both engines produce equal `84`-unit green thrust vectors, while the low-Isp engine uses a `4.2px` propellant-flow stroke and the high-Isp engine uses a `1.8px` stroke. After the same illustrated burn interval, the low-Isp tank retains `27` vertical units of fuel and the high-Isp tank retains `42`.
- Body/focus geometry: none.
- Craft position: two reusable tank/feed/engine-bell assemblies. Left tank `x=76`, `y=48`, `w=40`, `h=52`; right tank `x=204`, `y=48`, `w=40`, `h=52`. Engine bells open downward from `y=116` to `y=140`.
- Craft rotation: both engine assemblies point down, producing vehicle thrust upward.
- Thrust vectors: equal green arrows at `x=58` and `x=262`, each from `y=140` to `y=56`.
- Propellant-flow vectors: amber feed line from `(96,100)` to `(96,116)` at `4.2px`; matching line from `(224,100)` to `(224,116)` at `1.8px`.
- Formula: `Isp = F / (mass-flow × g0)` centered at `(160,25)`. The comparison holds `F` constant, so lower mass flow means higher Isp.
- Motion cue: none.
- Labels: `LOW ISP` and `HIGH ISP` below the bells; `mass-flow HIGH` and `mass-flow LOW` beneath those labels; each equal thrust vector is labeled `F`.
- Color mapping: thrust uses green `#8ce66f`; propellant and formula use amber; tank and engine outlines use cyan/orange.
- Layering: thrust arrows; tanks and fuel fills; feed lines; engine bells; formula and labels last.
- Forbidden marks: unequal thrust arrows, a larger flow rate on the high-Isp side, units of force for Isp, or copy implying that high Isp automatically means high thrust.
- Card-size render notes: formula remains above both tanks and all labels remain inside `y=190`.

### Ascending Node

- View: oblique dual-plane orbit view in which the current and reference orbits share exactly two opposite intersection nodes.
- Marker badge reservation: none.
- Current geometry: cyan ellipse `cx=160`, `cy=105`, `rx=104`, `ry=52`.
- Reference geometry: hot-pink dashed ellipse `cx=160`, `cy=105`, `rx=104`, `ry=16`. The two ellipses intersect only at the shared left and right vertices.
- Delta geometry: none; the card identifies a node rather than showing a plane-change result.
- Body/focus geometry: teal body `cx=160`, `cy=105`, `r=27`, with shine at `(151,95)`, `r=7`.
- Craft position: `translate(264 105)` on the right shared node.
- Craft rotation: `-90deg`, tangent upward on the current orbit as it crosses from below the reference plane to above it.
- Burn vector: none; crossing a node does not itself imply a burn.
- Result vector: none.
- Motion cue: 16 contiguous current-orbit segments from `t=100deg` down to `t=0deg`, ending at the right node and using the approved taper. The tail approaches from below the reference plane, making the northbound crossing explicit.
- Nodes: active ascending node at `(264,105)`, amber `r=5`; opposite descending node at `(56,105)`, dim cyan `r=3.5`.
- Depth layering: draw both complete ellipses behind the body; draw the body; redraw each lower/front half with `M 264 105 A 104 ry 0 0 1 56 105`; then draw tail, nodes, labels, and craft.
- Labels: active `AN` beside the right node; subordinate `DN` beside the left node; `REFERENCE` follows the hot-pink plane in the upper-left clear area.
- Color mapping: current orbit and tail use cyan; reference plane uses hot pink `#ff18b0`; active node and label use amber; craft uses established orange.
- Forbidden marks: more than two intersections, a craft off either node, a downward-pointing craft at the active ascending node, or a burn arrow with no maneuver being taught.
- Card-size render notes: node labels remain outside both orbit strokes and the active node/craft stay inside `x=280`.

### Descending Node

- View: exact vertical mirror of the ascending-node motion cue on the same oblique dual-plane geometry.
- Marker badge reservation: none.
- Current geometry: cyan ellipse `cx=160`, `cy=105`, `rx=104`, `ry=52`.
- Reference geometry: hot-pink dashed ellipse `cx=160`, `cy=105`, `rx=104`, `ry=16`, sharing only the two opposite vertices with the current orbit.
- Delta geometry: none; the card identifies a node rather than showing a plane-change result.
- Body/focus geometry: teal body `cx=160`, `cy=105`, `r=27`, with shine at `(151,95)`, `r=7`.
- Craft position: `translate(264 105)` on the right shared node.
- Craft rotation: `90deg`, tangent downward on the current orbit as it crosses from above the reference plane to below it.
- Burn vector: none.
- Result vector: none.
- Motion cue: 16 contiguous current-orbit segments from `t=-100deg` up to `t=0deg`, ending at the right node and using the approved taper. The tail approaches from above the reference plane, making the southbound crossing explicit.
- Nodes: active descending node at `(264,105)`, amber `r=5`; opposite ascending node at `(56,105)`, dim cyan `r=3.5`.
- Depth layering: full current and reference ellipses; body and shine; lower/front orbit halves; upper approach tail; nodes, labels, and craft last.
- Labels: active `DN` beside the right node; subordinate `AN` beside the left node; `REFERENCE` in the same fixed position as the ascending-node card.
- Color mapping: identical to ascending node so direction, tail position, node labels, and craft orientation are the only variables.
- Forbidden marks: geometry that is not a mirror of ascending node, a craft pointing north at the active descending node, more than two plane intersections, or an unrequested burn vector.
- Card-size render notes: preserve the exact ascending-node composition and label anchors for side-by-side comparison.

## New Card Template

Copy this section before adding or revising a technical diagram:

```md
### Card Name

- View:
- Marker badge reservation:
- Current geometry:
- Delta geometry:
- Body/focus geometry:
- Craft position:
- Craft rotation:
- Burn vector:
- Result vector:
- Motion cue, if any:
- Marker asset:
- Color mapping:
- Forbidden marks:
- Card-size render notes:
```
