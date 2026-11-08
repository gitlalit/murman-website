# murmanengineering.com

This is the Murman Engineering India Pvt Ltd website. It is a plain static site served free by GitHub Pages at https://www.murmanengineering.com. The domain is registered at GoDaddy.

## How it is organised
| Path | What it holds |
|---|---|
| `index.html` | the home page |
| `tools/green-fsi/index.html` | free Green FSI estimator page |
| `assets/site.css` | shared design system for every page (see DESIGN.md) |
| `assets/site.js` | shared behaviour: green FSI calculator, gallery filter, meeting form, copy buttons |
| `assets/favicon.svg` | the Murman shield mark |
| `img/` | project photos and client logo sheets |
| `CNAME` | tells GitHub Pages to serve www.murmanengineering.com (do not delete) |
| `PRODUCT.md` | company facts, services, claims we can and cannot make |
| `DESIGN.md` | colours, type, components and design rules |

## Updating the site with Claude
Ask Claude to work on the GitHub repository for this site. For example: "add a page for Murman SIGHT at /sight" or "change the phone number". Claude should:

1. Read PRODUCT.md and DESIGN.md first.
2. Edit the files, or add a new page as `name/index.html`, copying the header and footer from `index.html` and linking `/assets/site.css` and `/assets/site.js`.
3. Check the page at desktop and phone width.
4. Commit to the `main` branch.

GitHub Pages republishes automatically within a minute or two.

## Meeting form
The form sends through Web3Forms (free, 250 submissions a month) to info@murmanengineering.com. The access key is set in `assets/site.js` as `web3formsKey`. Until it is set, the form prepares a WhatsApp message to +91 88283 81670 instead.
