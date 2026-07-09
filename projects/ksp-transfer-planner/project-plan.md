# KSP Transfer Planner Project Plan

## Product Direction

KSP Transfer Planner should become a small suite of focused orbital planning tools for Kerbal Space Program. The product should not collapse every orbital maneuver into one overloaded calculator. Each planner mode should expose only the quantities that are meaningful for that maneuver family.

The first version focuses on same-body circular orbit changes. Later modes can add rendezvous, moon transfers, interplanetary transfers, and maneuver execution support.

Read `style-guide.md` before changing page copy, glossary cards, orbit diagrams, or planner visuals. Orbital drawings should be treated as technical drawings first, with KSP flavor layered only after the geometry is correct.

## Repository Taxonomy

Current route map:

- `projects/ksp-transfer-planner/`: intro hub for KSP, orbital mechanics 101, key terms, and planner family selection.
- `projects/ksp-transfer-planner/one-body/`: single-planet systems hub for local orbit planning, rendezvous, and captured satellite transfers.
- `projects/ksp-transfer-planner/one-body/orbit-plans/`: same-body orbit design tool family hub.
- `projects/ksp-transfer-planner/one-body/orbit-plans/hohmann/`: working Hohmann circular orbit raise/lower planner and mini-lesson.

The project should organize captured, local-orbit problems under `one-body/`. In this context, the "one body" is the host body that defines the local system: Kerbin with Mun and Minmus, Duna with Ike, Jool with its moons, and so on.

Initial one-body homes:

- `one-body/orbit-plans/`: orbit design around a single host body, including Hohmann elevation transfers, elliptical orbits, inclination changes, geosynchronous orbits, resonant orbits, polar coverage, Molniya-style orbits, and launch-site assist tools.
- `one-body/rendezvous/`: transfers to meet a craft or station in the same sphere of influence.
- `one-body/satellite-transfer/`: transfers from a host-body parking orbit to a captured moon or satellite, such as Kerbin to Mun or Minmus.

This keeps captured satellite transfers separate from true interplanetary transfers. Kerbin to Mun belongs under a one-body Kerbin system. Kerbin to Duna belongs in a later interplanetary or multi-body family where both origin and destination are in solar orbit, and where satellite orbits can be pulled in as assists, capture targets, braking opportunities, or local sub-problems.

## Core Design Principle

Keep orbital terms precise.

- Transfer angle is the angle the craft travels along the transfer path. For a same-body Hohmann transfer between circular orbits, this is locked to 180 degrees.
- Phase angle only applies when there is a second moving target to meet, such as a station, moon, or planet.
- Ejection angle applies to leaving a parking orbit for a moon or planet transfer.
- Burn timing describes when to start and end a finite-duration burn relative to a maneuver node.

If a quantity does not apply to the selected planner mode, the UI should not show it.

## Planner Families

### 1. Same-Body Orbit Tools

Purpose: plan orbit changes around one celestial body.

Aligned requirements:

- Support circular orbit raise/lower maneuvers.
- Calculate Hohmann transfer delta-v between circular orbits.
- Show burn 1, burn 2, total delta-v, transfer time, and transfer angle.
- Lock transfer angle to 180 degrees for same-body Hohmann transfers.
- Do not show phase angle unless a rendezvous target is introduced.
- Later: support elliptical orbit planning using periapsis and apoapsis.
- Later: support circularization burns at apoapsis or periapsis.

Current implementation belongs to this family.

### 2. Rendezvous Planner

Purpose: plan transfers to meet a target craft or station in the same sphere of influence.

Aligned requirements:

- Introduce a target object in an existing orbit.
- Calculate required target lead/trail angle at burn start.
- Show transfer time and relative arrival geometry.
- Estimate final matching burn after intercept.
- Consider phasing orbits as a later feature.

This is where phase angle becomes a meaningful primary readout.

### 3. Moon / Satellite Transfer Planner

Purpose: plan transfers from a primary body parking orbit to a moon or satellite, such as Kerbin to Mun or Minmus.

Aligned requirements:

- Select origin body, parking orbit, and target moon.
- Calculate transfer window / phase angle for the target moon.
- Estimate ejection burn from parking orbit.
- Estimate arrival speed and capture burn.
- Later: add free-return style options or capture/aerobraking notes where useful.

This family should reuse phase-angle concepts from Rendezvous, but at moon-scale.

### 4. Interplanetary Transfer Planner

Purpose: plan transfers between planets.

Aligned requirements:

- Select origin planet, destination planet, and parking orbit.
- Calculate planetary phase angle.
- Estimate ejection angle from parking orbit.
- Estimate ejection delta-v, transfer time, arrival velocity, and capture burn.
- Later: add porkchop plots once simpler transfer math and UI language are stable.

This should be treated as an advanced mode, not folded into the initial same-body orbit tool.

### 5. Maneuver Execution Helper

Purpose: help execute a planned burn in-game.

Aligned requirements:

- Accept burn delta-v, craft mass or TWR, and engine performance inputs.
- Estimate burn duration.
- Recommend centering ordinary maneuver burns on the node: start at node time minus half burn duration.
- Warn when burns are long enough that the instantaneous-node approximation becomes weak.
- Later: suggest split burns or periapsis kicks for low-TWR craft.

This family can support all other planner modes.

## Proposed Application Structure

The app should eventually expose a planner mode selector:

- Orbit Change
- Rendezvous
- Moon Transfer
- Interplanetary
- Burn Timing

Each mode should have its own inputs, readouts, diagram annotations, and explanatory helper text. Shared constants, formatting, orbital math utilities, and body data should be reusable across modes.

## Near-Term Roadmap

1. Finish Orbit Change cleanly.
2. Keep same-body Hohmann readouts limited to delta-v, transfer time, and transfer angle.
3. Add a clear conceptual split between no-target orbit changes and rendezvous-target planning.
4. Build Rendezvous as the first true phase-angle planner.
5. Build Mun/Minmus transfer next, using the same phase-angle language at moon scale.
6. Defer interplanetary planning until the UI, terminology, and shared math helpers are stable.

## Open Questions

- Should the Orbit Change mode support elliptical start/target orbits before Rendezvous?
- Should planner modes live as separate routes, tabs, or a segmented control within one app shell?
- Should KSP body constants include atmosphere height and sphere of influence in the first refactor?
- How much in-game instruction should appear directly in the tool versus in expandable notes?
- Should the first suite remain static/client-only, or should saved mission plans become a future feature?
