# Murman website design system

Read this before adding or changing any page. Every page uses `assets/site.css` and `assets/site.js`. Do not add page-specific stylesheets unless a page truly needs a new component, and then add the component to `site.css`.

## World
The Murman letterhead and the sanctioned-plan drawing set. The navy band, the diagonal corner and the shield mark come from the letterhead. Tables, schedules and area statements come from the drawings a developer reads every day.

## Colour (brand kit only, rebuilt 5 Nov 2026)
The five brand kit colours, plus three tints mixed from them. No other colours.

| Token | Value | Role |
|---|---|---|
| `--navy` | #070F5A | headings, primary buttons, header, footer, navy bands, status "Available" |
| `--blue` | #004AAD | links, focus ring, button hover, hero accent line |
| `--tan` | #B8987F | rules, list markers, timeline, watermark, labels on navy. Never as text on white (2.6:1) |
| `--white` | #FFFFFF | page ground, forms, records |
| `--black` | #000000 | body text |
| `--tan-tint` | #F2ECE8 | alternate section ground, input cells, highlight rows |
| `--tan-mid` | #DFD1C5 | status "In pilot", hover on tint, form highlights |
| `--line` | #D7D9E5 | hairlines and input borders |
| `--ink-2` | #4C4C4C | secondary text on white (8.6:1) |
| `--on-navy-2` | #C8CADB | secondary text on navy (10.5:1) |

- **Status in example records:** use shape and words as well as colour. "Pass" is a navy outline with a tick, "Rework" is solid navy, "Follow up" is tan-mid.
- **Section rhythm:** white, then `.sec.tint`, then `.sec.navy`, alternating. Never two navy bands in a row.

## Type scale
| Role | Token | Notes |
|---|---|---|
| Hero | `--t-hero` | fluid, up to 5rem, tracking -0.035em |
| Section heading | `--t-h2` | fluid, up to 2.9rem |
| Item heading | `--t-h3` | 1.35rem |
| Lead | `--t-lead` | |
| Body | `--t-body` | 1.125rem (18px), line height 1.7 |
| Small | `--t-small` | 1rem; meta text `--t-meta` 0.875rem is the smallest size used |
| Label | `--t-label` | 0.8125rem, used sparingly for table headers, status tags and audience labels |

Keep body text within 45 to 75 characters a line.

## Spacing
4px base: `--s1` (0.25rem) up to `--s9` (7rem). Sections use `--s9` vertical padding (`--s8` on phones). Never override spacing with inline styles. Leave more space above a heading than below it.

## Components in site.css
| Class | What it is |
|---|---|
| `.site-head` | navy header band with brand, nav, Book a meeting and the phone Menu button |
| `.site-foot` | navy footer with the blue diagonal corner |
| `.btn-primary`, `.btn-secondary`, `.btn-tan` | primary (navy), secondary (navy outline) and on-navy (tan) actions |
| `.sec`, `.sec.tint`, `.sec.navy`, `.intro` | sections and their heading-plus-lead block |
| `.hero`, `.lead`, `.actions`, `.context`, `.tool-link` | home opening, lead paragraph, buttons, cited context line, free-tool pointer |
| `.stage`, `.svcs`, `.svc`, `.state` | services by life-cycle stage, each in plain view, with status |
| `.mrv`, `.flow`, `.record`, `.tag` | Digital MRV band, its steps, the example record table, status tags |
| `.columns` | three prose columns under tan rules |
| `.record-top`, `.timeline`, `.filters`, `.gallery` | track record intro, dated sequence, sector filter, photos |
| `.clients`, `.logo-row`, `.logo-track` | moving client logo strip with pause button |
| `.team`, `.person`, `.shield` | leadership, with shield-shaped initials |
| `.meet`, `.steps`, `.contact`, `.form`, `.field`, `.picks` | meeting block and form |
| `.tool-hero`, `.crumb`, `.statement`, `.st-table` | free tool pages and the area-statement calculator |

## Rules (from the Impeccable design rulebook)
- **No eyebrow or kicker labels above headings.** The heading carries itself.
- **No hero-metric rows** of big number, small label.
- **No grids of identical icon-and-text cards,** and never cards inside cards. Use rules, tables and schedules instead.
- **No gradient text.** No glass or blur as decoration. No coloured left or right borders thicker than 1px on cards.
- **No emoji or Unicode symbols as icons.** Icons are inline SVG with a 1.75 stroke.
- **One authored motion moment per page:**
  - On the home page, it is the result-row flash in the area statement.
  - Animate only transform, opacity and colour.
  - Respect reduced motion.
- **Theme the browser surfaces.** Selection, caret, scrollbar, focus ring, link underline offset and tabular numerals all take the palette.
- **Contrast:** body text at least 4.5:1, large text at least 3:1.
- **Phone width:** every page must work at 390px wide with no sideways scroll. A grid child that holds a table needs `min-width:0`.
