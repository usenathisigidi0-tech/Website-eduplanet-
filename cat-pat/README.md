# Online Banking — CAT PAT Grade 12 (2026), Phase 3 website

A four-page website investigating how online banking affects the security and
convenience of South African consumers.

## Files

| File | Purpose |
|---|---|
| `home.html` | Introduction to the topic, purpose, focus question, site map |
| `research.html` | What online banking is, benefits, fraud types (table), safety steps, method |
| `findings.html` | Questionnaire results (table), bar graph, analysis, conclusion, recommendations |
| `bibliography.html` | Sources with dates accessed, plus how to write up a source |
| `css/pat.css` | One stylesheet for all four pages |
| `js/pat.js` | Scroll reveal + back-to-top button (the site works fully without it) |
| `img/favicon.svg` | The padlock icon in the browser tab |

## Viewing it

Double-click `home.html`. It opens straight from the filesystem — no server needed.

To test it properly (recommended before handing in), run a local server from
this folder so the links behave exactly as they would online:

```
python3 -m http.server 8000
```

Then open <http://localhost:8000/home.html>.

## THREE THINGS TO DO BEFORE YOU HAND IN

1. **Put your real questionnaire numbers in.** `findings.html` currently holds
   placeholder figures. Replace the numbers in Table 2 with the totals from your
   Phase 2 spreadsheet, then update the graph — the comment directly above the
   `<svg>` explains it: **bar width = percentage × 4**. Change the `width` on the
   `<rect>` and the number in the `<text>` beside it.
2. **Fix the e-mail address.** All four pages link to
   `usenathi.pat@example.com`. Search and replace it with your real address.
3. **Fix the bibliography dates.** `bibliography.html` has `__ / __ / 2026`
   placeholders. Put in the real dates you opened each site, and delete any
   source you did not actually use.

## Bugs that were fixed from the first draft

| Was | Problem | Now |
|---|---|---|
| `allign="center"` | Misspelled, so it did nothing | Alignment handled in CSS |
| `<a ...><font ...>Home</a>` | `<font>` opened but never closed inside the link | No `<font>` tags at all; colour is in CSS |
| `</body>` then `<html>` | Closing tag written as an opening tag | `</body></html>` |
| No `<!DOCTYPE html>` | Browsers fall back to "quirks mode" | Declared on every page |
| Links to `Home.html`, file named `home.html` | Works on Windows, **404s on a real web server** (Linux is case-sensitive) | Every filename and link is lowercase |
| `Reaserch.html.html` | Double extension — the Research link would break | `research.html` |
| No `<meta charset>` | `—` and `“ ”` can render as `â€"` | `<meta charset="utf-8">` on every page |
| `bgcolor` attributes | Removed from the HTML standard | CSS custom properties |

## Rubric items and where to find them

- **Consistent navigation on every page** — the `<header>` block, identical on all four, with the current page marked `class="here"`
- **Headings** — `<h1>`, `<h2>`, `<h3>` used in order on every page
- **Text formatting** — `<strong>`, `<em>`, `<small>` throughout
- **Table** — three of them: Table 1 (`research.html`), Table 2 (`findings.html`), Table 3 (`bibliography.html`), all with `<caption>`, `<thead>` and `<th scope>`
- **Unordered list** — `ul.ticks` on the home, research and bibliography pages
- **Ordered list** — the sub-questions (`home.html`), safety steps and recommendations
- **Internal link within a page** — the "On this page" jump links on `research.html`
- **Links between pages** — the nav bar and the cards on `home.html`
- **External link** — SABRIC and the Reserve Bank, opening in a new tab
- **E-mail link** — the `mailto:` link in every footer
- **Graphic** — `img/favicon.svg`, plus the bar graph drawn in SVG on `findings.html`
- **Graph of results** — `findings.html`
- **Background colour** — set in `css/pat.css`
- **Bibliography** — its own page

## Notes on how it was built

- **One stylesheet, not inline styles.** All four pages link `css/pat.css`, so a
  colour is changed in one place instead of four.
- **The site works without JavaScript.** `js/pat.js` only adds the fade-in and
  the back-to-top button. If it is blocked, every page still reads normally.
- **It is designed to be printed.** The `@media print` block at the bottom of the
  stylesheet removes the dark backgrounds and the nav bar, and prints the full
  web address after every external link, so the printed copy in your PAT file is
  readable in black and white.
- **It works on a phone.** Tested at 390px wide with no sideways scrolling; wide
  tables scroll inside their own box instead of stretching the page.
