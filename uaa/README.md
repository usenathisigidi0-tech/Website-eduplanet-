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

### How a submission is delivered

Delivery never depends on scripted navigation. Assigning `location.href` to a
`mailto:` URL is blocked outright inside a sandboxed frame, which used to drop
the enquiry while still showing a thank-you. There are now two honest outcomes:

- **Posted** — an endpoint is set and returned a success. The visitor sees
  "Thanks! We'll get back to you within 24 hours with your quote."
- **Handoff** — the post failed (no connection, or Formspree returned an error). The visitor sees their
  brief written out, with Copy / Send on WhatsApp / Open in email buttons they
  click themselves, plus the address and number in plain text.

Either way the answers survive.

The handoff **redirects rather than instructs**. Three rows, each a real link
the visitor taps once: **Send on WhatsApp** (leads, because it is the only one
that carries the brief — the chat opens with it already written), **Send by
email** (`mailto:` with brief and subject filled in) and **Call us now**
(`tel:`, straight to the dialler). Copying is folded away under "Rather copy and
paste it yourself?" for anyone who wants it.

A page inside a frame it cannot reach out of — an embedded preview — has
`mailto:`, `tel:` and external links refused by the host ("Blocked opening …").
Only there is the row of three hidden, a line shown saying why, and the copy
fallback unfolded so there is still a way out. **None of that appears on a
deployed site**, where `isConfined()` is false and the three redirects lead.

A successful post also offers "Rather chat now? WhatsApp us" beneath the
thank-you, since the brief is already delivered and some people want to talk.

**A preview embed blocks the POST itself too**, so a form tested inside one
always lands on the handoff no matter how healthy the endpoint is. Posting can
only be judged on a real domain.

### Turning on posted delivery

This is **live**. The endpoint is set near the top of `assets/js/uaa.js`:

```js
var FORM_ENDPOINT = 'https://formspree.io/f/mgavwnon';
```

Both forms read it; that one line is the only place it appears. A `data-endpoint` attribute on an
individual form overrides it. Any endpoint accepting a `POST` of `FormData`
works: Formspree, Netlify Forms, an n8n or Make webhook, your own script.

What the forms already handle:

- **`Accept: application/json`** so Formspree replies with JSON instead of
  redirecting the visitor to its own thank-you page.
- **Real error checking.** `fetch` only rejects on network failure, so an HTTP
  4xx/5xx is caught by hand and drops to the handoff. A rejected submission can
  never show a false "thank you".
- **Reply-to sent twice**, as `_replyto` and as `email`. Formspree reads the
  first on older forms and the second on newer ones, so replying in Gmail
  answers the enquirer either way.
- **`_subject`** gives a readable subject: "Quote request — Web App — Bay
  Plumbing Co."
- **`_gotcha`** is a hidden spam trap; bots fill it, the submission is dropped.
- The submit button disables in flight, so a double-click cannot send twice.
- Copy tries `execCommand` before the async Clipboard API, because a sandboxed
  frame blocks the latter under a permissions policy. If both fail the text is
  already selected and the button says so.

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
- **Nothing fetches video before the page has painted.** Every `<video>` is
  `preload="none"`; ambient clips start on `load` + idle, skip sections the
  chosen track is hiding, and stand down entirely when Data Saver is on or the
  connection reports 2g. Each has a poster, so the design holds if video never
  arrives. First load is ~383 KB.
