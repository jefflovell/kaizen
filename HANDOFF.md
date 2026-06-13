# Hello World Handoff

## Project

- Local folder: `/Users/kaizen/Documents/hello-world`
- GitHub repository: https://github.com/jefflovell/hello-world
- Live site: https://jefflovell.github.io/hello-world/
- Deployment: GitHub Pages from `main`, repository root

## Current State

The first version is a dependency-free static personal site built with:

- `index.html`
- `styles.css`
- `script.js`
- `.nojekyll`

It includes a responsive hero, About/Work/Contact navigation, a three-part
principles section, a current-project section, and a mobile navigation menu.

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
