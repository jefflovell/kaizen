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

Before coding a diagram:

- State the coordinate plan.
- Define the `viewBox`.
- Define the orbit geometry explicitly with coordinates and dimensions.
- Place nodes on the actual geometry, not by visual guesswork.
- Calculate tangent-aligned craft markers from the geometry.
- Keep labels anchored to meaningful nodes or regions.

Rules for orbit diagrams:

- Use SVG primitives and explicit path geometry.
- Prefer one clean orbit path over layered approximations.
- If a direction cue is needed, style the trajectory itself rather than attaching stray lines to the craft.
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
