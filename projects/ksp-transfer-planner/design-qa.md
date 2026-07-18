# Orbit Hero Purple-to-White Return Transition — Design QA

- Source problem capture: `/Users/kaizen/Desktop/Screenshot 2026-07-18 at 11.58.37 AM.png`
- Tangent-circle guide: `/Users/kaizen/Desktop/Screenshot 2026-07-18 at 12.00.18 PM.png`
- Browser-rendered implementation: `/tmp/ksp-return-arcs-desktop.png`
- Mobile implementation: `/tmp/ksp-return-arcs-mobile.png`
- Combined comparison: `/tmp/ksp-return-arcs-comparison.png`
- Viewports: `1366 × 900` desktop and `390 × 844` responsive
- State: `http://127.0.0.1:4173/#orbit-hero`

## Findings

- No actionable P0, P1, or P2 mismatch remains.
- The purple free-return segment now leaves the lunar arc on its exact tangent and follows one broad, monotonic sweep toward Earth.
- The white re-entry segment begins at `(240,330)` with the same tangent and curvature as the purple segment, then tightens smoothly to a tangential lower-left surface contact.
- The previous wave, reversal, and chicane are gone; the result follows the reference's tangent-circle construction while preserving the approved purple-to-white phase mapping.
- Purple and white directional tails remain intact at `16` segments each, and the other five phase tails are unchanged.

## Full-view comparison evidence

The three-panel comparison shows the circled problem, the user's white/hot-pink tangent-circle guide, and the rebuilt production diagram together. All approved planet, Moon, launch, insertion, circularization, transfer, gravity-brake, craft, vector, and label relationships remain unchanged outside the return/re-entry region.

## Focused-region comparison evidence

At the purple-to-white patch, both cubics share tangent vector `(-45.35,0)` and second-difference vector `(16.76,-21.06)`. The purple cubic's Moon-side control vector has slope `-1.73196`, matching the lunar arc tangent slope `-1.732`. The white terminal vector is `(-20,-20)`, matching the planet's local tangent at the `135deg` contact point. Sampled clearance remains outside the `r=48` planet until the intended contact.

## Required fidelity surfaces

- Fonts and typography: existing slab-mono family, weights, sizing, tracking, and label hierarchy are unchanged.
- Spacing and layout rhythm: the rebuilt paths stay inside the established plot and preserve the hero's image/copy proportions; the free-return label moved only enough to clear its new curve.
- Colors and visual tokens: free return remains `#a96bff`, re-entry remains `#d9f2f7`, and every other phase color is unchanged.
- Image quality and asset fidelity: established vector craft, bodies, arrows, and tails remain sharp and unchanged; no raster substitute or scaling artifact was introduced.
- Copy and content: narrative and phase copy are unchanged.

## Comparison history

- Earlier P1: the purple return and white re-entry formed a visible chicane with competing curvature and an orbit-like wobble near Earth. Fix: replaced the multi-cubic snake with one purple cubic and one white cubic constructed as a curvature-continuous chain. Post-fix evidence: the combined comparison shows one clean broad-to-tight transition matching the tangent-circle guide.
- Earlier P2: the white re-entry path approached the planet through a visually unstable sequence of bends. Fix: terminated the new white cubic on the exact local surface tangent. Post-fix evidence: the white path now meets the lower-left surface shallowly without crossing the body.

## Runtime and integrity checks

- Primary interaction: root page → `#orbit-hero` anchor → rebuilt sequence observed.
- Render health: meaningful DOM, no framework overlay, no horizontal overflow, and no console warnings or errors.
- Responsive check: diagram and narrative stack cleanly at `390 × 844`.
- Static integrity: seven phases retain `16` tail segments each (`112` total), with `9` craft snapshots, `4` burn vectors, and `6` gravity vectors.
- Source hygiene: `git diff --check` passes.

final result: passed
