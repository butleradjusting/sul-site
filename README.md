# SUL — Snooze U Lose

Static streetwear storefront for snoozeulose.com. The current local redesign uses charcoal, silver, and royal blue, with an interactive design studio, printed-set gallery, five product pages, and a persistent shopping bag.

## Run locally

```sh
npm run dev
```

Open http://127.0.0.1:4173. The pages are ordinary HTML and require no application server, dependencies, or compilation to serve.

## Edit and rebuild

- `scripts/build.mjs`: shared navigation, footer, page layouts, and homepage content.
- `assets/catalog.js`: existing product names, prices, sizes, descriptions, photos, and test checkout links.
- `assets/style.css`: responsive design and motion.
- `assets/site.js`: browser interactions and bag state.
- `assets/images`: optimized supplied imagery with embedded source provenance.
- `assets/provenance.json`: source register for imagery and fonts.
- `PRODUCT.md` and `DESIGN.md`: product boundaries and current design system.

After editing page templates or the catalog:

```sh
npm run build
```

Keep the generated HTML checked in for GitHub Pages. The production site is https://snoozeulose.com, published from the `main` branch root. Existing page URLs and CNAME are preserved.

## Commerce and incoming assets

The five existing Stripe links use test mode. The bag stores size and quantity locally; individual test checkout links do not receive those selections. A live checkout and inventory integration remain separate work.

New chrome/crown designs and printed sets are studio previews until the owner confirms pricing and availability. The supplied production planning board is retained in the owner's Downloads folder and is not included in the website.

## Verify

`scripts/smoke.cjs` runs browser checks with Playwright against the local server. Use an installed Playwright package, or set `SUL_PLAYWRIGHT_PATH` to the package provided by your environment. Run with:

```sh
node scripts/smoke.cjs
```

Checks cover filters, sorting, size validation, bag quantities and persistence, galleries, studio/printed-set/lookbook controls, mobile navigation, and eight routes at six viewport widths, including narrow 320px phones.
