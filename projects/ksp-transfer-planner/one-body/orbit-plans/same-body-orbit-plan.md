# Same-Body Orbit Design Plan

Oh, this is a delicious lane. I’d frame this family as **Same-Body Orbit Design**, with Hohmann as the first “clean-room theorem” inside it.

A few very KSP-able, real-world-rooted planners:

**1. Circular Orbit Raise / Lower**
The current Hohmann planner. Two tangential burns, circular, coplanar, clean as glass.

Real-world tie: this is how spacecraft tidy up their orbit after launch, raise into a safer parking orbit, nudge a station back where it belongs, or move satellites into the shell where they can start doing their job.

KSP joy tagline: “Two burns, one orbit, and only a modest chance someone asks why re-entry is now a philosophical problem.”

Mini-lesson: “Why two burns? First changes the shape, second removes the ellipse.”

**2. Inclination Change Planner**
Change from equatorial to polar, retrograde, sun-synchronous-ish, etc.

Real-world tie: polar and high-inclination satellites sweep over more of the planet as it spins underneath them, which makes them perfect for mapping, weather, ice tracking, and the kind of “observation” everyone pretends is mostly about clouds.

KSP joy tagline: “Turn north after launch, they said. It’ll be fine, they said. The recovery team has requested fewer optimists in mission planning.”

Mini-lesson: plane changes are cheapest when velocity is lowest, so do them high or combine them with apoapsis burns.

**3. Combined Hohmann + Plane Change**
Raise/lower orbit and change inclination in one optimized-ish second burn.

Real-world tie: real missions rarely get perfect textbook moments, so flight planners often blend altitude and plane changes into one burn to save fuel, time, or whatever dignity remains in the propellant budget.

KSP joy tagline: “Do the altitude change and plane change together, because if we’re going to waste fuel, we may as well call it vector math.”

Mini-lesson: vector addition, not coupon stacking.

**4. Geosynchronous / Geostationary Orbit Planner**
Pick a body, calculate the orbital altitude where period equals body rotation.

Real-world tie: geosynchronous satellites orbit once per planetary day, so they can keep showing up over the same region for communications, weather watching, broadcasting, and other “why is that thing always up there?” services.

KSP joy tagline: “Park politely above the same patch of dirt forever, for communications, weather, or the quiet geopolitical pressure of an orbital railgun throne.”

Distinction:
- Geosynchronous: same period as the body’s rotation.
- Geostationary: geosynchronous, circular, equatorial, prograde, fixed over one longitude.

**5. Resonant Orbit Planner**
Set an orbit whose period is a ratio of another orbit: `2:1`, `3:2`, `4:3`, etc.

Real-world tie: satellite constellations use orbital timing like a clockwork bead necklace, spacing vehicles around a shared orbit so coverage appears steady instead of clumped into one very expensive parade.

KSP joy tagline: “Release satellites at mathematically pleasing intervals until the whole world wonders if the shape is intentional and the tracking station stops asking follow-up questions.”

Mini-lesson: period is the hidden clock behind constellation spacing.

**6. Repeat Ground Track Planner**
Find orbits that pass over the same ground track after some number of rotations/orbits.

Real-world tie: repeat ground tracks let a satellite revisit the same places on a schedule, which is useful for mapping change over time: crops, storms, roads, glaciers, construction sites, and anything else that gets nervous under a camera.

KSP joy tagline: “Fly over the same place again and again, because mass surveillance sounds better when you call it coverage.”

Mini-lesson: the planet rotates under the orbit; ground track is orbit plus spinning map.

**7. Polar Mapping Orbit Planner**
Design a near-polar orbit with altitude/period guidance for full surface coverage.

Real-world tie: a polar mapper eventually sees almost every latitude because the planet rotates beneath its north-south path, turning one orbit track into a slow peel of the whole world.

KSP joy tagline: “See the whole planet eventually, including the parts the mission brief described as ‘outside scope’ shortly before losing contact.”

Mini-lesson: polar orbit gives latitude coverage; altitude and period affect revisit rhythm.

**8. Retrograde Orbit Planner**
Same-body orbit, but intentionally against rotation.

Real-world tie: retrograde orbits move against the planet’s spin, which costs extra energy but can be useful for special coverage, unusual science goals, or missions that care more about geometry than politeness.

KSP joy tagline: “How expensive is spite? Very.”

Mini-lesson: launching with rotation is free velocity; launching against it makes the planet charge you interest.

**9. Elliptical Orbit Designer**
Set periapsis and apoapsis directly, then calculate insertion/circularization options.

Real-world tie: elliptical orbits are useful when you want a spacecraft to dive close for speed or science, then coast far away for time, coverage, communications, or a dramatic pause before the next questionable decision.

KSP joy tagline: “Spend most of your time far away from your problems, then return to periapsis at a speed that suggests you should have just dealt with them like an adult.”

Mini-lesson: apoapsis is where you loiter; periapsis is where velocity gets scary.

**10. Molniya-Style Orbit Planner**
Highly elliptical, high-inclination orbit with long dwell time over high latitudes.

Real-world tie: Molniya-style orbits solve a real high-latitude problem: geostationary satellites sit near the equator, so highly elliptical tilted orbits can hang over northern or southern regions for much longer each pass.

KSP joy tagline: “Linger dramatically over the high latitudes, because geostationary orbit refused to look north and Russia took that personally.”

Mini-lesson: elliptical orbits spend most of their time near apoapsis.

**11. Bi-Elliptic Transfer Planner**
Three-burn transfer that can beat Hohmann for very large radius changes.

Real-world tie: a bi-elliptic transfer uses three burns and a very high apoapsis to sometimes beat a Hohmann transfer on fuel for huge orbit changes, proving that “go farther first” is occasionally not a terrible sentence.

KSP joy tagline: “What if we went absurdly far away first? Sometimes genius, usually a lot of paperwork and several very carefully worded press releases.”

Mini-lesson: cheapest is not always shortest, and orbital mechanics is allergic to intuition.

**12. Launch Site Assist Planner**
Estimate how much rotational velocity a launch site gives you based on latitude and launch azimuth.

Real-world tie: launch sites get free sideways speed from the rotating planet, and the amount depends on latitude and launch direction, which is why equatorial launches are prized and high-latitude launches start with a lecture from geometry.

KSP joy tagline: “Launch from the right latitude and the planet helps. Launch from the wrong one and the planet becomes a very large, very smug physics professor.”

Mini-lesson: your starting latitude quietly decides what inclinations are easy.

I’d put these into a first “Same-Body Orbit Design” roadmap like this:

1. Hohmann raise/lower
2. Elliptical orbit designer
3. Inclination change
4. Combined transfer + plane change
5. Geosynchronous/geostationary orbit
6. Resonant orbit / constellation spacing
7. Polar and repeat-ground-track planner
8. Molniya-style orbit
9. Bi-elliptic transfer
10. Launch site assist

The teaching spine could be: **shape, tilt, timing, coverage**.

That gives the whole family a beautiful internal logic:

- Shape: circular, elliptical, Hohmann, bi-elliptic
- Tilt: inclination, polar, retrograde
- Timing: geosync, resonant, repeat ground track
- Coverage: polar mapping, Molniya, constellation shells
