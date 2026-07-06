# Kaizen Handoff

## Project

- Local folder: `/Users/kaizen/Documents/kaizen`
- GitHub repository: https://github.com/jefflovell/kaizen
- Live site: https://jefflovell.github.io/kaizen/
- Deployment: GitHub Pages from `main`, repository root

## Current State

The first version is a dependency-free static personal site built with:

- `index.html`
- `styles.css`
- `script.js`
- `.nojekyll`

It includes a responsive hero, About/Work/Contact navigation, a three-part
principles section, a current-project section, and a mobile navigation menu.

Recent work renamed the project from `hello-world` to `kaizen` and moved the
ML note pages toward a more explicit issue-card style: Epic surfaces use
purple, Story surfaces use gold, active statuses use blue, shipped statuses use
green, and not-started roadmap work uses light grey. The homepage and ML index
now lean on sharp bordered cards, restrained soft shadows, and flat color
blocks rather than decorative gradients for their own sake.

## Style and Tone Baseline

- Use the site palette as a system, not confetti: blue for active status and
  technical labels, gold for Story-style learning cards, grey for `TO DO`,
  cyan/coral for controlled accents, and lavender/purple for Epic or connective
  emphasis.
- Prefer flat blocks with soft offset shadows over heavy drop shadows, dark
  callouts, or ornamental color bands.
- Main section headings should be plain-language titles. Longer explanatory
  lines belong underneath as larger blue all-caps subtitles, separated by a
  restrained block divider.
- Teaching prose should feel human and confident, but not vague. If a sentence
  sounds polished while hiding the mechanism, slow it down and name the moving
  parts.

## Verification

- Desktop viewport checked at 1280x720
- Mobile viewport checked at 390x844
- No horizontal overflow
- Mobile menu open/close behavior verified
- No browser console errors
- Live GitHub Pages URL verified after deployment

## Local-Only References

These files are useful for design comparison but intentionally excluded from
Git:

- `design-concept.png`
- `site-desktop.png`
- `site-mobile.png`

## Known Follow-Ups

- Revisit the visible name/brand (`KAIZEN`) and final personal-site copy.
- Add metadata such as social preview image, favicon, and canonical URL.
- Consider moving Google Fonts to local assets if external font loading is
  undesirable.

## Future Feature Requests

### Interactive Digital Sea

Turn the hero background into a full-width, low-poly digital ocean inspired by
the luminous geometric environments of *Tron: Legacy* and *Tron: Ares*.

- Treat the header's horizontal rule as a shoreline or the boundary of an
  invisible tank.
- Render the water from small geometric shapes, likely with a Canvas 2D
  spring-mesh simulation.
- On desktop, loop a wave that travels left to right, crashes, and retreats.
- On mobile, let device tilt and acceleration apply forces to the water.
- Provide pointer input as a desktop fallback.
- Include a user-triggered motion-permission control where required.
- Preserve an autonomous fallback when motion access is unavailable or denied.
- Respect `prefers-reduced-motion` and keep the effect performant on phones.

Estimated effort: 4-6 hours for a prototype or 1-2 days for a polished,
responsive implementation.

## Working Notes

The repository was initially committed locally, then uploaded through GitHub's
web interface because command-line Git authentication was unavailable. GitHub
CLI is now installed and authenticated through the macOS keychain, so future
changes can be pushed directly from the local repository.

Preview locally with:

```sh
python3 -m http.server 8000
```
