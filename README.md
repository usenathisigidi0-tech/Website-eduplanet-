# EduPlanet Independent School — website

A static, six-page marketing site for EduPlanet Independent School, 1 Eveready Road,
Struandale, Gqeberha. No framework, no build step required to host it: the `.html`
files at the repo root are the site.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home — video hero, why EduPlanet, ethos, school-life preview |
| `about.html` | Story, Christian ethos, mission, core values, registration details |
| `academics.html` | CAPS curriculum, external examination board, the four phases |
| `admissions.html` | How to apply, required documents, application links |
| `school-life.html` | Sport, creative work, photo gallery |
| `contact.html` | Phone, WhatsApp, emails, address, office hours |

## Running it locally

Any static server works. From the repo root:

```
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Opening `index.html` straight from the filesystem
also works, though some browsers restrict local video playback over `file://`.

## Editing

The header, footer and page metadata are shared, so they are generated rather than
copy-pasted into six files. Edit `tools/build_pages.py` and re-render:

```
python3 tools/build_pages.py
```

That rewrites all six `.html` files in place. Content, contact details and page copy
all live near the top of that script. Styling lives in `assets/css/styles.css` and
behaviour in `assets/js/main.js`; neither is generated, so edit those directly.

## Assets

- `assets/img/` — web-ready photos, cropped from the originals to remove the phone
  screenshot letterboxing. `hero-poster.jpg` is the hero's still fallback.
- `assets/video/` — the hero loop as WebM (VP9, 1.8 MB) and MP4 (H.264, 2.3 MB).
  WebM is offered first; MP4 covers Safari.
- `assets/source/` — the untouched originals, kept for reference. Nothing here is
  referenced by the site, so it can be deleted before deploying if you want a
  smaller upload.
- `assets/img/eduplanet-mark.svg` — the brand mark, **redrawn by hand** from the
  logo frame in the supplied video. If you have the official vector logo, replace
  this file and the inline copy in `tools/build_pages.py` (`MARK`).

## Behaviour worth knowing

- **The hero video is decorative and gated.** It is only downloaded on screens that
  will actually show it. Phones, portrait tablets, coarse-pointer devices, short
  landscape screens, reduced-motion users and anyone with Data Saver on get the
  poster image and download no video at all.
- **The page is complete without JavaScript.** Scroll entrances are opt-in via a
  `js` class set in `<head>`; if the script is blocked, fails or throws, that class
  is removed after 4 seconds and every section renders plainly visible.
- **Fonts do not block rendering.** The Google Fonts stylesheet loads
  asynchronously, with system serif/sans fallbacks, so a slow or filtered font host
  cannot stall the page.

## Before going live

1. Patch the two `<!-- DEPLOY STEP -->` Open Graph tags in `tools/build_pages.py`
   (`og:url`, `og:image`) with the real absolute URLs, then re-run the build.
2. Optionally delete `assets/source/` to cut the deployed size.
3. Serve over HTTPS from any static host — GitHub Pages, Netlify, Vercel or the
   existing eduplanet.co.za hosting.

## School details used on the site

Registered independent school, Grade RR–12, established 2016.
Department of Education EMIS 200100266 · Examination centre 4342022 ·
Company registration 2016/040404/07.
Phone 041 451 1046 · WhatsApp 060 527 3468 ·
principal@eduplanet.co.za / info@eduplanet.co.za / accounts@eduplanet.co.za
