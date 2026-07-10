# KSP Transfer Planner Style Guide

## Teaching Voice

This is a Kaizen tool: it should teach, not just calculate. The tone should feel like a clever KSP parts description got promoted to mission control. Keep the explanations plain-English and useful, but let the gallows humor stay alive.

Good copy should:

- Explain the actual mechanism instead of hiding behind jargon.
- Treat jokes as teaching handles, not replacements for clarity.
- Use KSP-style disaster humor without making the page feel mean or careless.
- Prefer concrete mental models over abstract summaries.
- Make real orbital mechanics feel approachable enough to try in-game.

## Page Structure

Use terminal-style orange/typewriter headings for major page and section titles. Taglines should be smaller than the title and should support the section, not compete with it.

The root page pattern is:

- Hero: KSP-specific title and press art.
- What Is KSP?: plain-language introduction and project framing.
- Key Terms: compact glossary cards with technical diagrams where helpful.
- Where to?: planner family cards.

Avoid "director's notes" copy that explains the page structure from outside the experience. The page should speak as the tool, not about the tool.

## Technical SVG Diagrams

Glossary and planner diagrams should be precise SVG technical drawings, not decorative illustrations.

This is how orbital drawings should be treated throughout the project: technical drawing first, KSP flavor second. The geometry has to be right before the image gets cute.

Hard rule: do not edit a technical SVG diagram from intuition. Before changing diagram markup, update `diagram-spec.md` with the coordinate-level plan for the affected card, including current geometry, delta geometry, craft position, craft rotation, burn vector, marker badge reservation, and every visible stroke. If a visible mark cannot be justified by that spec, delete it. If the mechanics are uncertain, stop and ask instead of inventing a plausible-looking drawing.

Before coding a diagram:

- Update and read `diagram-spec.md` for the card being changed.
- State the coordinate plan.
- Define the `viewBox`.
- Define the orbit geometry explicitly with coordinates and dimensions.
- Place nodes on the actual geometry, not by visual guesswork.
- Calculate tangent-aligned craft markers from the geometry.
- Keep labels anchored to meaningful nodes or regions.
- Render-check the diagram at card size before calling it done.

Rules for orbit diagrams:

- Use SVG primitives and explicit path geometry.
- Prefer one clean orbit path over layered approximations.
- If a direction cue is needed, style the trajectory itself rather than attaching stray lines to the craft.
- For burn-direction cards, key the changed orbit, resulting-vector arrow, and icon treatment to the KSP marker color for that burn direction. Prograde uses marker green; carry the same marker-color logic through retrograde, normal, anti-normal, radial in, and radial out.
- Use top-down orbit views for prograde, retrograde, radial in, and radial out. Use an edge-on ecliptic/plane view for normal and anti-normal so the plane-change direction is visible instead of pretending it is an altitude change.
- Reserve the navball marker badge first, then draft the orbit around that reserved space. Do not let the craft, burn arrow, orbit node, or labels crowd the marker badge; move the craft to the opposite side when needed.
- Use tapered/fading trajectory cues only when they clarify the motion without cluttering the card. If a cue is used, it belongs on the actual current trajectory and is anchored to the craft geometry: thickest at the exhaust nozzle side, then thinning/fading along the orbit until it is thinnest at the nose-cone side. Do not use generic left-to-right gradients, do not reverse the taper, and do not paint broad decorative strokes across the diagram. For radial and plane-change cards, prefer a clean burn vector plus current/delta orbit geometry over noisy motion strokes.
- For retrograde, mirror the prograde composition when the marker badge would crowd the craft: put the craft on the opposite side, reverse the tangent burn, and lower the opposite side.
- For normal and anti-normal, use the Saturn-ring edge-on convention: draw the ecliptic as a horizontal line through the body, then draw the orbit plane as a tipped ring around the body. Normal starts from the blue ecliptic and adds a purple dotted inclined ring. Anti-normal reverses the colors: blue is the current inclined ring, and purple dotted is the target ecliptic line. Keep arrows long and on the non-badge side.
- For radial in/out, do not delete the orbital consequence just because it is subtler than prograde/retrograde. Show the burn vector along the planet-craft radius and include a cautious dashed delta orbit that shares the burn point while rotating/reshaping the path; avoid implying a simple apoapsis raise/lower.
- Do not place craft markers off the trajectory.
- Do not let periapsis intersect the body unless the concept is impact.
- Do not add decorative guide lines unless they teach something specific.
- Avoid emoji for technical markers unless explicitly requested.
- Keep effects restrained; no glow-heavy decoration that obscures the geometry.

Approved Apoapsis card geometry:

- `viewBox="0 0 320 210"`
- Orbit ellipse: `cx=160`, `cy=105`, `rx=112`, `ry=92`
- Planet at the left focus: `(97, 105)`
- Planet radius: `34`
- Periapsis clears the surface because the left vertex is at `x=48`, leaving about `15px` of clearance from the planet edge.
- Apoapsis node at the right vertex: `(272, 105)`
- Craft marker on the ellipse near `t=-35deg`: approximately `(252, 52)`
- Craft marker tangent angle: approximately `50deg`
- Direction highlight is a short arc on the same ellipse from about `t=-85deg` to `t=-35deg`, styled as a tapering/fading trajectory stroke.

Correction phrase for future work:

> Stop illustrating. Draft it like an engineering diagram.
