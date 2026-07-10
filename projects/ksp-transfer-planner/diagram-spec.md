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
- Burn vector: `x1=109`, `y1=90`, `x2=109`, `y2=41`; tangent up, offset above craft.
- Result vector: `x1=233`, `y1=104`, `x2=287`, `y2=104`; points outward to raised far side.
- Motion cue: none.
- Forbidden: blue tail detached from the orbit, broad path strokes, result color that is not prograde green.

### Retrograde

- View: top-down orbit view.
- Marker badge: bottom-left shared badge.
- Must literally reverse prograde's role logic.
- Current orbit: larger blue ellipse `cx=172`, `cy=104`, `rx=89`, `ry=85`.
- Delta orbit: smaller green dashed circle `cx=199`, `cy=104`, `r=62`.
- Body: `cx=199`, `cy=104`, `r=27`.
- Craft: `translate(261 104) rotate(90)`, on right side of current orbit, nose down.
- Burn vector: `x1=261`, `y1=99`, `x2=261`, `y2=50`; tangent/reversed, same 49px stem length as prograde, attached to the craft chevron center.
- Result vector: `x1=83`, `y1=104`, `x2=137`, `y2=104`; horizontal, same 54px length as the prograde result arrow, from the left side of the original blue orbit toward the smaller green orbit, with a blue-to-green stroke.
- Motion cue: 12 short arc segments on the current blue ellipse from about `t=-60deg` to `t=0deg`; segment stroke grows gradually toward the craft so the cue is thinnest far behind and thickest at the exhaust-nozzle side.
- Forbidden: crowding the marker badge, putting the craft on the marker side, making the arrow unreadable.

### Radial Out

- View: top-down orbit view.
- Marker badge: bottom-left shared badge.
- Current orbit: blue circle `cx=160`, `cy=104`, `r=58`.
- Delta orbit: cyan dashed ellipse `cx=160`, `cy=92`, `rx=58`, `ry=70`, `transform=rotate(-22 160 46)`.
- Body: `cx=160`, `cy=104`, `r=27`.
- Craft: `translate(160 46) rotate(0)`, on top of current orbit.
- Burn vector: `x1=160`, `y1=34`, `x2=160`, `y2=14`; radial out, away from body, with a small gap above the craft.
- Radial guide: `x1=160`, `y1=104`, `x2=160`, `y2=46`.
- Motion cue: none.
- Forbidden: deleting the delta orbit, drawing a prograde-style far-side altitude raise.

### Radial In

- View: top-down orbit view.
- Marker badge: bottom-left shared badge.
- Current orbit: blue circle `cx=160`, `cy=104`, `r=58`.
- Delta orbit: cyan dashed ellipse `cx=160`, `cy=116`, `rx=58`, `ry=70`, `transform=rotate(22 160 46)`.
- Body: `cx=160`, `cy=104`, `r=27`.
- Craft: `translate(160 46) rotate(0)`, on top of current orbit.
- Burn vector: `x1=160`, `y1=58`, `x2=160`, `y2=88`; radial in, toward body, with a small gap below the craft.
- Radial guide: `x1=160`, `y1=104`, `x2=160`, `y2=46`.
- Motion cue: none.
- Forbidden: deleting the delta orbit, drawing a prograde-style far-side altitude lower.

### Normal

- View: edge-on Saturn-ring convention.
- Marker badge: bottom-left shared badge.
- Current geometry: horizontal blue ecliptic line `x1=92`, `y1=106`, `x2=286`, `y2=106`.
- Delta geometry: purple dotted edge-on tipped ring `cx=189`, `cy=106`, `rx=86`, `ry=12`, `transform=rotate(-14 189 106)`.
- Body: `cx=189`, `cy=106`, `r=27`.
- Craft: `translate(254 106) rotate(0)`, on non-badge side of the current plane.
- Burn vector: `x1=254`, `y1=94`, `x2=254`, `y2=54`; normal/up from the current plane, with a gap above the craft.
- Motion cue: none.
- Forbidden: mixed 3/4 orbit plus axis line, cramped short arrows, broad decorative strokes.

### Anti-normal

- View: edge-on Saturn-ring convention.
- Marker badge: bottom-left shared badge.
- Current geometry: blue edge-on tipped ring `cx=189`, `cy=106`, `rx=86`, `ry=12`, `transform=rotate(14 189 106)`.
- Delta geometry: purple dotted horizontal ecliptic line `x1=92`, `y1=106`, `x2=286`, `y2=106`.
- Body: `cx=189`, `cy=106`, `r=27`.
- Craft: `translate(254 120) rotate(0)`, on non-badge side of the current inclined ring.
- Burn vector: `x1=254`, `y1=132`, `x2=254`, `y2=156`; anti-normal/down from the current inclined plane.
- Motion cue: none.
- Forbidden: treating the ecliptic as current, crowding the marker badge, mixed 3/4 orbit plus axis line.

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
