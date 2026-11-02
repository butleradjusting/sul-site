# S.U.L. Women's Collection — owner handoff

Prepared 2026-11-01. Everything below is built and previewed but **not published**. The collection is set to Coming Soon.

## What is built

- **Homepage section** (`index.html#womens`) with the collection copy, the four colorways, and a *Shop Women's Collection* button underneath.
- **Main menu**: *Women's* in the desktop navigation, the mobile menu, and the footer.
- **Collection page** `womens.html`: four colorway cards, the four looks with prices, the size guide, and the closing statement.
- **Four product pages**, one per colorway: `womens-olive-luxe.html`, `womens-navy-cream.html`, `womens-midnight-black.html`, `womens-blush-pink.html`. Each page lets a customer choose one of four looks (16 complete outfits across the four pages), choose a size, and read the size guide and product details.
- **Coming Soon state**: launch pricing is shown, the size row works, and the purchase button is disabled and labelled *Coming soon*. Nothing from the women's collection can be added to the bag until you switch it on.
- **Live state (ready, switched off)**: per-size stock counts drive the size buttons (sold-out sizes are struck through and cannot be chosen), low stock shows *Only N left*, the bag caps quantity at the stock count, and each look hands off to its own Stripe Payment Link.

## The 16 outfits

| # | Look | Pieces | Launch price (draft) |
|---|------|--------|------------|
| 01 | The Crown Set | Fitted crown crop top + sculpting high-rise leggings | $110 |
| 02 | The Oversized Set | Oversized crown sweatshirt + fitted bike short | $120 |
| 03 | The Pleated Set | Fitted crown tank + pleated mini skirt | $115 |
| 04 | The Knit Set | Premium-inspired knit cardigan + matching knit midi skirt | $135 |

Each look comes in Olive Luxe, Navy & Cream, Midnight Black, and Blush Pink. Sizes XS – XL.

## Platform and access

- The website is a static site hosted on **GitHub Pages** from the repository `butleradjusting/sul-site`, `main` branch, custom domain snoozeulose.com with HTTPS enforced.
- The `butleradjusting` GitHub account **owns the repository and has full admin rights** (verified 2026-11-01). Anyone who should edit the site needs to be added as a collaborator on that repository.
- Checkout is **Stripe Payment Links**. These open Stripe's hosted, mobile-optimised checkout, so customers pay securely from their phones without the site handling card details. The five existing links are still Stripe *test* links.

## What I need from you

1. **Confirm or change the launch prices** in the table above.
2. **Per-size inventory counts** for all 16 outfits (XS, S, M, L, XL each). These go into `assets/womens.js` under each colorway's `inventory`.
3. **Product photography**: at least one photo per look per colorway (16 images), ideally on a model and as a flat lay. The pages currently show generated colorway cards labelled *Studio preview · Photography to follow*.
4. **Fabric and care details** for the tops, bottoms, and knits. The pages currently say *Fabric: confirmed at launch*.
5. **Size chart sign-off**: the chart on the site is a standard US women's chart in inches. Confirm it against your production samples.
6. **Stripe**: create a live Payment Link per outfit (16 links) in your Stripe account, or tell me to create them if you give me access. The existing links are test mode and the bag states this.
7. **Instagram handle**: the Coming Soon pages point to instagram.com/snoozeulose for the launch date. Confirm that is the account you want.

## Switching the collection on

1. Fill in prices, inventory, and checkout links in `assets/womens.js`.
2. Change `womensStatus` from `'coming-soon'` to `'live'`.
3. Run `npm run build`, check the pages, and push `main`.

To preview the live state without changing the catalog: `SUL_WOMENS_STATUS=live npm run build`.
