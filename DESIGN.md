# Murman website design system

Read this before adding or changing any page. Every page uses `assets/site.css` and `assets/site.js`. Do not add page-specific stylesheets unless a page truly needs a new component, and then add the component to `site.css`.

## World
The Murman letterhead and the sanctioned-plan drawing set. The navy band, the diagonal corner and the shield mark come from the letterhead. Tables, schedules and area statements come from the drawings a developer reads every day.

## Brand kit (fixed, from the Murman Letterhead and Brand Kit PDF)
| Role | Token | Value |
|---|---|---|
| Primary | `--navy` | #070F5A |
| Secondary | `--blue` | #004AAD |
| Accent | `--tan` | #B8987F (use `--tan-ink` #6F5440 when tan is text) |
| Page ground | `--paper` | #F6F6FA (white tinted toward navy) |
| Working surface | `--sheet` | #FFFFFF |
| Body text | `--ink` | #0E1240 (navy-tinted, never pure black) |
| Secondary text | `--ink-2` on paper, `--on-navy-2` on navy | never grey on a coloured ground |

- **Display face:** Montserrat 700/800.
- **Text face:** DM Sans 400 to 700.
- **No other families.**
- **Logo:**
  - Use the inline SVG shield mark with "MURMAN" and "ENGINEERING INDIA PVT LTD" set in Montserrat.
  - The mark is white on navy and navy on light grounds.
- **Theme:** light only. The visitor is a developer, banker or PMC at a desk or on site in daylight.

## Type scale
| Role | Token | Notes |
|---|---|---|
| Hero | `--t-hero` | fluid, up to 4.75rem, tracking -0.035em |
| Section heading | `--t-h2` | fluid, up to 2.75rem |
| Item heading | `--t-h3` | 1.3rem |
| Lead | `--t-lead` | |
| Body | `--t-body` | 1.0625rem |
| Small | `--t-small` | 0.875rem |
| Label | `--t-label` | 0.72rem uppercase, only for table headers and status tags |

Keep body text within 45 to 75 characters a line.

## Spacing
4px base: `--s1` (0.25rem) up to `--s10` (8rem). Sections use `--s9` vertical padding. Leave more space above a heading than below it.

## Components in site.css
| Class | What it is |
|---|---|
| `.site-head` | navy header band with the brand and nav |
| `.site-foot` | navy footer with the blue diagonal corner |
| `.btn-navy`, `.btn-line`, `.btn-tan` | primary, secondary and on-navy actions |
| `.sec` and `.sec-intro` | a section, and its heading plus lead paragraph |
| `.statement` and `.st-table` | the area-statement table (green FSI calculator) |
| `.schedule`, `.stage`, `.svc` | the services schedule, with expandable rows |
| `.band` | navy section with the letterhead diagonal top edge |
| `.report` | example data table on a white sheet |
| `.audiences` | three prose columns divided by rules |
| `.timeline` | a dated sequence |
| `.gallery` and `.filters` | project photos with sector filter |
| `.team` and `.person` | people, with the shield-shaped initials |
| `.meet`, `.steps`, `.contact`, `.form` | the meeting request block |
| `.status.ready`, `.status.pilot`, `.tag.ok`, `.tag.warn`, `.tag.bad` | state labels |

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
