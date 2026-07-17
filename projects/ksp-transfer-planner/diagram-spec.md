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
