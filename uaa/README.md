# UAA Agency — website

A single-page site for UAA Agency (websites, AI receptionists, motion design).
Static HTML/CSS/JS, no build step, no dependencies. Open `index.html` or serve
the folder.

## The idea

The site asks one question before it shows anything: **"What brings you here?"**
The visitor picks *Websites*, *AI receptionist*, or *Both*, and the whole page
rearranges around that answer — different headline, different sections,
different pricing, different FAQ, and even a different accent colour.

| Track | Accent | Shows |
|---|---|---|
| `web` | Ember `#ff7a45` | Websites, work, website pricing |
| `ai` | Cyan `#35e4ff` | Receptionist, live call demo, receptionist pricing |
| `both` | Violet `#8b5cf6` | Everything — both pricing sections and the monthly plans |

Motion design, process, FAQ and the quote form are always shown.

The choice is stored in `localStorage` under `uaa.track` and can be forced with
a query string for sharing or testing: `?track=web`, `?track=ai`, `?track=both`.
An inline script in `<head>` resolves it before first paint so the page never
flashes the wrong offer. Visitors can change their mind any time via the
WEB / AI / BOTH switch in the header, or "Change what I'm here for" in the footer.

## Layout

```
uaa/
  index.html
  assets/
    css/uaa.css        design tokens + every component
    js/uaa.js          gate, track state, video, call demo, quote flow
    fonts/             Bricolage Grotesque (display), Figtree (body), JetBrains Mono (labels)
    img/               logo, favicon, video poster frames
    video/             the motion reels
```

## Things to change before launch

Everything below is a placeholder I filled in so the site is complete and
working. Search for the value and replace it.

| What | Where | Current placeholder |
|---|---|---|
| ~~Email address~~ | — | **Set** to `usenathisigidi0@gmail.com` (6 places in `index.html`, 2 `mailto:` fallbacks in `uaa.js`) |
| ~~Phone / WhatsApp~~ | — | **Set** to 063 932 9054 — `tel:+27639329054` and `wa.me/27639329054`, in the footer and the quote aside |
| Demo phone number | `#demo` call card | `+27 ••• ••• 4118` — deliberately masked: it stands for an *incoming caller*, not your number |
| Location | hero kicker, footer | Gqeberha, South Africa |
| ~~All prices~~ | — | **Done** — the real ZAR price list is live in `#pricing-web`, `#monthly-plans` and `#pricing-ai` |
| The three hook stats | `.hook .stats` | **Illustrative industry figures** — verify or replace them; there's a footnote on the page saying so |
| Motion design pricing | `.reelcta` in `#motion` | No price given, so the tile routes to the quote dialog |
| Logo | `assets/img/uaa-mark.svg` + `favicon.svg` | Original mark I designed; drop your real logo in at the same paths and nothing else changes |

### The two forms

`#quote-form` is the general four-step enquiry in the `#quote` section — every
"Get Started" button lands there with the plan it came from pre-filled.
`#qm-form` is the dialog the "Get a Quote" buttons open, for Custom Website and
Web App.

### Turning on reliable delivery

Both forms currently fall back to `mailto:`, which opens the *visitor's* own
mail app and relies on them pressing send. To have submissions posted straight
to your inbox instead, set one value near the top of `assets/js/uaa.js`:

```js
var FORM_ENDPOINT = 'https://formspree.io/f/XXXXXXX';
```

That is the only edit needed — both forms read it. A `data-endpoint` attribute
on an individual form overrides it if you ever want them going to different
places. Any endpoint accepting a `POST` of `FormData` works: Formspree, Netlify
Forms, an n8n or Make webhook, your own script.

What the forms already do for you:

- **`Accept: application/json`** on the request, so Formspree replies with JSON
  instead of redirecting the visitor to its own thank-you page.
- **Real error handling.** `fetch` only rejects on network failure, so an HTTP
  4xx/5xx is checked by hand. Anything other than a success falls back to
  `mailto:` — a rejected submission can never show a false "thank you".
- **`_replyto`** carries the enquirer's address, so hitting reply in Gmail
  answers *them*, not you.
- **`_subject`** sets a readable subject line: "Quote request — Web App — Bay
  Plumbing Co." rather than a generic one.
- **`_gotcha`** is a hidden spam trap. People never see it; bots fill it in and
  the submission is dropped without being sent.
- The submit button disables while the request is in flight, so an impatient
  double-click cannot send twice.

### Adding more motion reels

Drop `yourclip.mp4` into `assets/video/` and a `yourclip-poster.jpg` into
`assets/img/`, then copy one `<article class="reel">` block in `#motion` and
point it at the new files. Add it before the `.reelcta` tile that closes the grid.

Poster frames were generated with:

```
ffmpeg -ss 4 -i assets/video/CLIP.mp4 -frames:v 1 -q:v 4 -vf scale=640:-2 assets/img/CLIP-poster.jpg
```

## Moving the site to the domain root

It currently lives in `/uaa/` so the existing EduPlanet site in this repo keeps
working. To promote it:

```
git mv uaa/index.html uaa/assets .        # or move EduPlanet into /eduplanet/ first
```

All asset paths are relative, so nothing needs editing either way.

## Notes

- Works without JavaScript: every section renders, the gate simply never appears
  and the visitor sees the "both" version of the site.
- Respects `prefers-reduced-motion` — reveals, the marquee, the typed call
  transcript and smooth scrolling all stand down.
- No horizontal scroll at 390px; the layout collapses at 1080px, 900px and 640px.
- Videos autoplay muted and looping. Reel sound is opt-in per tile, and only one
  tile can be unmuted at a time.
