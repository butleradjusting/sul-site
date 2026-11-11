# SUL — Snooze U Lose

## Current Redesign — 2026-10-03

The working folder is `/Users/kb/Documents/ChatGPT/SUL`. GitHub Pages publishes `main` to https://snoozeulose.com. Read `PRODUCT.md` and `DESIGN.md` for current product boundaries and the built visual system. The owner chose a working website directly, without a mockup round, and supplied chrome/blue garment studies, printed shirt/shorts photographs, and a crown hoodie sample. The new visual direction is charcoal, cool silver, and royal blue. The older brand notes below are historical context where they conflict with these current files.

The site remains static HTML/CSS/JavaScript. `scripts/build.mjs` generates the homepage, collections, the product routes, and 404. Edit that template and `assets/catalog.js` rather than modifying generated HTML by hand. `assets/style.css` and `assets/site.js` contain the shared design and interactions. Run `npm install` once, then `npm run build` after template, catalog, or `src/` changes. Local preview: `npm run dev`, http://127.0.0.1:4173.

The bag persists size and quantity on the current device. All existing payment links are Stripe test links; no live checkout has been added. New designs and printed sets have no confirmed prices or availability and remain explicitly labeled studio previews. The production planning board is not included in the website. The owner authorized publication and requested mobile verification on 2026-10-03.

## Women’s First Drop — 2026-10-31

The owner’s launch plan (2026-10-31) sells 27 complete women’s outfits in four colorways: Olive 4-piece $149.99 (7 sets), Navy/Cream 3-piece $129.99 (7), All Black 3-piece $129.99 (8), Blush Pink 3-piece $129.99 (5). Each set is a listing in `assets/catalog.js` under `sets`, with its own page (`olive-set.html`, `navy-cream-set.html`, `black-set.html`, `pink-set.html`), a homepage section (`index.html#drop`), and a Women filter on the collections page.

`drop.status` in `assets/catalog.js` controls the state. It is `'coming-soon'` until the shipment is received and inspected: cards and pages say Coming soon, and the action is "Claim your size", which opens a prefilled email to sulcollective@gmail.com (no payment, no backend). Switch it to `'live'` and rebuild for Available now, add-to-bag, and email order links in the bag. No Stripe link exists for the sets. The owner’s inventory list (2026-10-31) supplies the pieces and the per-size run; each set’s `stock` object holds it, `sizes` is derived from it, and the set page prints “Made per size”. Only the black set has a 2XL. Set photos are crops of the owner’s campaign image (source kept at `site-photos/campaign-womens-collection.webp`, full lineup at `assets/images/womens-drop.webp`); the colorway swatch tile remains as a fallback for any set without an `image`. Piece lists in the catalog are read from that image and marked “as pictured”. The smoke test accepts `SUL_PLAYWRIGHT_PATH` and `SUL_PLAYWRIGHT_CHANNEL` (for example `chrome`). The build also writes `sitemap.xml` from the catalog. A parallel placeholder build of the women’s collection (`womens.html`, `assets/womens.js`, generated colorway cards; merged as PR 2 on 2026-11-02) was replaced by this version on 2026-11-04.

The Bomber Jacket is shelved (2026-11-01): its entry sits in `shelved` in `assets/catalog.js`, its page and sitemap entry are removed, and the Outerwear filter disappears while no outerwear is listed. Its price is under review; move the entry back into `products` and rebuild to relist it.

Every size selector (product pages, set pages, quick view) has a Size guide link beside its label. It opens the shared `#size-dialog`, filled by `openSizeGuide` in `assets/site.js` from each style’s `fit`/`fitNote` in the catalog and the `sizeCharts` there. The fit notes are the owner’s (2026-11-01): sweatshirts relaxed and oversized, the olive fitted set close and stretchy, skirt outfits sized by waist and hip. The olive and skirt charts (`sizeCharts.olive`, `sizeCharts.skirt`, chosen by each set’s `sizeChart`) are the owner’s numbers of 2026-11-01, body measurements plus the skirt’s own length; the unisex chart for the older pieces is standard US sizing until those garments are measured.

## Drop Launch and Checkout — 2026-11-05

The owner launched the women’s drop (`drop.status` is `'live'`). Sets show Available now and add to the bag. Checkout in the bag gives one Stripe link per style that has a **live** Payment Link, with sizes and quantities passed as `client_reference_id` (for example `black-set_2XL-1_L-2`), and one prefilled email order to sulcollective@gmail.com for everything else. Test-mode links (`buy.stripe.com/test_…`) are never shown to customers; `isLiveCheckout` in `assets/catalog.js` decides. Set links go in `setCheckout`, older products in their `checkout` field; rebuild after pasting. No live Stripe link has been supplied yet, so every order currently goes by email. Stock is not decremented automatically: set a size to 0 in `stock` and rebuild when it sells out.

## Storefront Polish — 2026-11-05

The bag caps each set at its per-size `stock` (`maxQuantity` in `assets/catalog.js`), so set a size to 0 when it sells out and rebuild; the size then leaves the page and any saved bags. `_config.yml` excludes internal files from the Jekyll build so they are not served on snoozeulose.com; add new internal files to it. The repository itself is public, so anything committed is still readable on GitHub. The Olive set page leads with three AI concept images (`renders` in the catalog, `olive-render-*.webp`), labeled on the page; cards and link previews still use the campaign crop, and sets without `renders` show only the campaign photos. Link previews are covered under “Link Previews” below. The set photos are small crops of one 1254px campaign image, so the set gallery is capped at 480px on desktop until individual photos exist.

## Design Pass — 2026-11-05

A pass against the Design plugin skills, `ui-ux-pro-max`, and `skills/` changed the storefront without changing the brand. The hero leads with the women’s campaign image (what is for sale), and the drop section no longer repeats it. The site header is sticky and tucks away on scroll down. Phones get a fixed buy bar on product and set pages (`buyBar` in `scripts/build.mjs`, wired at the end of `assets/site.js`), hidden while the page’s own add button or the footer is on screen. Small text moved up one step, targets are 44px, and color literals became tokens in `:root` (`--wine` is now `--blue`; `.button.wine` is now `.button.blue`). Fonts load from Latin-subset WOFF2 files with the TTFs as fallback. Printed-set photos are 900px wide. The Full Kit card uses the mannequin photo so it no longer repeats the Blackout Hoodie photo. The `ui-ux-pro-max` generated design system (webinar pattern, Syne, orange CTA) was rejected because it conflicts with the owner’s brand.

The owner removed the crown hoodie sample photo on 2026-11-05 (“this is horrible remove this photo”), along with the logo crop made from it. Do not put it back. It remains readable in the public repository’s git history.

## 3D Redesign — 2026-11-05

The owner rejected the flat, square look and asked for 3D that is “wow like no other.” `DESIGN.md` is rewritten for it and overrides the Design Pass above where they differ (the header is now a floating pill that tucks only during the homepage flight).

- `src/world.js` is the homepage Three.js scene, bundled to `assets/world.js`. `src/motion.js` (Lenis smooth scroll, card tilt, magnetic buttons, world loader) is bundled to `assets/motion.js`. Both bundles are committed because GitHub Pages does not build. Do not edit them by hand.
- `html.world` is set by an inline gate in `<head>` on the homepage (WebGL2, no reduced motion, no save-data). `world.js` steps quality down on slow frames and removes the class to fall back to the static layout. `?world` in the URL turns off the frame-rate fallback while testing.
- `scripts/3d/build_logo.py` (Blender) traces `assets/images/sul-wordmark.png` into `assets/3d/sul-logo.bin` and `sul-logo.svg`. `scripts/3d/capture_poster.cjs` photographs the live logo for `assets/images/sul-chrome-poster.webp`.
- The wall reads each set from the `[data-ring-item]` attributes the build writes. Glow colors are `glowFor` in `scripts/build.mjs`. Colorway photos are still the 380x570 campaign crops, so individual photos would show immediately.
- The renderer uses no tone mapping on purpose, so garment photos keep their real color.

## Link Previews — 2026-11-05

What a shared link shows follows Apple’s TN3156: short titles without the site name (`og:site_name` carries it), no printed words in preview images, images at least 900px wide, and a square icon. `shareTags` in `scripts/build.mjs` writes the tags. Each product shares a 1000x1250 photo in `assets/share/`, titled name and price from the catalog; the homepage shares `sul-film.mp4` (the real 3D logo flight landing on all four sets, which Messages plays by itself) with `womens-drop.jpg` as its still. Icons are `favicon.ico` and `apple-touch-icon.png` at the root, plus `assets/images/icon-*.png` and `site.webmanifest`. All product previews are Higgsfield `nano_banana_2` images (sources in `site-photos/share-generated/`): the women’s sets and lineup are edits of campaign crops that changed the background and lighting, and the older products are AI models wearing the pictured garment. `product-photoshoot` was rejected for these because it redrew the crown and lettering, so compare prints before replacing one. The women’s cards, 3D wall, and set pages now use the same edits (`*-set-studio.webp`, `womens-lineup.webp`), labeled as AI-edited on those pages, with the original crop kept as the Set view (`campaignCrop`), so the older “set gallery capped at 480px” note no longer applies. Older products now lead with the AI model shots too (`*-model.webp`, labeled on the page), with the earlier photo in `photo`. The printed sets on the homepage now lead with an AI model shot (`*-look.webp`) and use AI cleaned photos of the samples (`*-shirt-studio.webp`, `*-shorts-studio.webp`), and the section says so; the factory table originals stay in `assets/images/`. `scripts/share/build_share_assets.cjs` makes all the preview files, so rerun it when those photos change, and add a crop to `PHOTOS` for any new product. Messages caches a preview per link on each device, so test changes with a link that has not been sent before, for example by adding `?v=2`.

## Brand Overview
- **Brand Name:** SUL (Snooze U Lose)
- **Owner:** Kev (butleradjusting@gmail.com)
- **Type:** Streetwear x Loungewear clothing brand
- **Target Audience:** Gen Z (18-25), trend-driven, social media savvy, value authenticity
- **Stage:** Growing — established in-person sales, building online presence
- **Location:** Miami, FL (based on Brickell Ave photoshoot)

## Brand Identity
- **Tagline:** "Don't Sleep On Style"
- **Vibe:** Bold, confident, comfort-first streetwear. The lion logo represents never sleeping on opportunity.
- **Color Palette:**
  - Primary: Deep Maroon/Burgundy `#7a1f3d`
  - Secondary: Gold/Warm accent `#c8a96e`
  - Background: Black `#0a0a0a`
  - Text: White `#f5f5f5`
- **Fonts:** Space Grotesk (headings), Inter (body)
- **Logo:** Lion head with "SUL" text — embroidered look, black & white on black background

## Products
- **Matching Sweatsuit (White/Maroon)** — Flagship product. Hoodie + joggers, white colorway with maroon "SNOOZE U LOSE" block lettering. Premium heavyweight cotton, relaxed/oversized fit. $120
- **Blackout Hoodie (Black)** — All-black hoodie with white SUL sleeve print. $85. Product page: `blackout-hoodie.html`
- **Bomber Jacket (Black/Gold)** — Black satin bomber with gold SUL embroidery. $125. Product page: `bomber-jacket.html`
- **Graphic Hoodie (White/Maroon)** — White hoodie with maroon graphic print. $65
- **Joggers (White/Maroon)** — White joggers with maroon SUL branding. $55
- **Full Kit (Hoodie + Joggers + Tee)** — Bundle deal. $160. Product page: `full-kit.html`
- **Lion Sweater** — Heavyweight knit with embroidered lion crest. $95. Product page: `lion-sweater.html`
- **New Era Trucker Hat (Black)** — Black mesh trucker cap with 3D embroidered SUL logo, New Era collab. Adjustable snapback. $45. Product page: `new-era-hat.html`

## Project Structure
```
SUL/
├── index.html              # Main landing page (hero, marquee, about, shop grid, lookbook, values, newsletter, footer)
├── collections.html        # Shop/collections browse page — links to individual product pages
├── blackout-hoodie.html    # Product detail page — Blackout Hoodie
├── bomber-jacket.html      # Product detail page — Bomber Jacket
├── lion-sweater.html       # Product detail page — Lion Sweater
├── new-era-hat.html        # Product detail page — New Era Trucker Hat
├── index-full.html         # Legacy/backup full landing page
├── CLAUDE.md               # This file — project context
├── CNAME                   # Custom domain config (snoozeulose.com)
├── README.md               # Repo readme
├── swag-store-directory.md # Store reference notes
├── old/                    # Archived versions
│   └── index-full.html
├── site-photos/            # Brand photography, product shots & video assets
│   ├── sul-logo.png                # SUL lion logo (PNG, used in nav)
│   ├── sul-logo.jpg                # SUL lion logo (JPG alternate)
│   ├── product-hoodie-black.jpg    # Black hoodie + SUL cap on mannequin, store display
│   ├── product-bomber-display.jpg  # Black satin bomber jacket with gold embroidery, store display
│   ├── product-hat-front.png       # New Era hat front view — 3D embroidered SUL logo
│   ├── product-hat-side.png        # New Era hat side view — New Era flag, mesh back
│   ├── SUL New Era Hat Front.png   # Original hat front photo (source file)
│   ├── SUL New Era Hat Side.jpg    # Original hat side photo (source file)
│   ├── SUL Bomber Product Image.png # Bomber jacket product image
│   ├── lookbook-outdoor.jpg        # Nature/park photoshoot in white sweatsuit
│   ├── lookbook-city.jpg           # Brickell Ave, Miami city photoshoot
│   ├── image-Photoroom.png         # Photoroom-edited product image
│   ├── image.jpg                   # Misc product image
│   ├── video-hoodie-black.mp4      # Product video — black hoodie
│   ├── video-bomber.mp4            # Product video — bomber jacket
│   ├── video-promo.mp4             # Brand promo video
│   └── WhatsApp Image *.jpeg       # Raw WhatsApp photos (various, unsorted)
└── skills/                 # Frontend design skills — ALWAYS read before editing site
    ├── taste-skill.md      # Core design quality rules: layout, typography, color, motion, spacing
    ├── redesign-skill.md   # For upgrading/auditing existing design — audit-first approach
    ├── soft-skill.md       # Premium "expensive" look & feel: whitespace, depth, smooth animations
    └── output-skill.md     # Anti-laziness rules — forces complete code output
```

## Design Skills (IMPORTANT)
When editing `index.html` or creating any new frontend code for SUL, ALWAYS read and follow the skills in `skills/`:
- **taste-skill.md** — Primary design rules: layout, typography, color, motion, spacing. Controls design variance, motion intensity, and visual density.
- **redesign-skill.md** — Use when improving existing pages. Audit-first approach.
- **soft-skill.md** — Premium feel: big whitespace, layered depth, smooth animations, floating nav.
- **output-skill.md** — Prevents lazy/incomplete code output.

These skills override default AI design patterns to produce modern, premium interfaces instead of generic templates.

## Website Details
- **Domain:** snoozeulose.com (GitHub Pages via CNAME)
- **Architecture:** Multi-page static HTML site — landing page + collections page + individual product detail pages
- **Landing page (index.html):** Hero, Marquee, About, Shop Collection grid (6 products with category filters + cart), Lookbook (hidden), Brand Values (hidden), Newsletter, Footer
- **Collections page (collections.html):** Browse/shop grid linking to product detail pages
- **Product pages:** Each product has its own detail page with image gallery, thumbnails, size selector, add-to-cart, and product specs
- Dark theme with maroon + gold accents
- Mobile responsive with hamburger menu
- Scroll reveal animations
- Cart functionality with slide-out drawer
- Newsletter signup form
- Social links: Instagram, TikTok, X

## Image Naming Convention
Photos in `site-photos/` should be named descriptively using the `product-` prefix for product shots:
- `product-hat-front.png` — Hat front view (main product image)
- `product-hat-side.png` — Hat side/back view (secondary thumbnail)
- `product-hoodie-black.jpg` — Black hoodie on mannequin
- `product-bomber-display.jpg` — Bomber jacket display
- `lookbook-outdoor.jpg` — Nature/park setting photoshoot
- `lookbook-city.jpg` — Urban/city street photoshoot
- `sul-logo.png` / `sul-logo.jpg` — Brand logo
- Pattern: `product-[item]-[view].ext`, `lookbook-[location].ext`, `campaign-[season].ext`

## Current Sales Channels
- In-person (pop-ups, markets, local retail)
- Website live at snoozeulose.com (GitHub Pages) — product showcase with cart UI
- Goal: Full e-commerce checkout integration

## Next Steps
- Sort and rename WhatsApp images in site-photos/
- Add product images for lion sweater and graphic hoodie
- Integrate payment/checkout (Shopify or similar)
- Build social media content calendar
- Create pitch deck for retail partnerships
- SEO optimization
- Unhide Lookbook and Brand Values sections when content is ready

## Crown Set Headliner — 2026-11-09

The owner sent real photos of the Charcoal Crown Set (washed charcoal hoodie and joggers, chrome crown crest on the back) and asked to make it the headliner. It sits in `#crown`, right after the 3D wall and before the women's sets, and the hero button points to it. Its data is `headliner` in `assets/catalog.js`, and its photos are `assets/images/crown-set-*.webp`. No price or sizes are confirmed, so it shows "Ask SUL" and the action is an email. Add `price` and rebuild to show one. The photos arrived at 565px wide, so swap in the full-size originals when they come.

## Reliability Pass — 2026-11-10

Found by using the site on iPhone Safari (iOS 26.5 simulator) and with the 3D off. All covered by `scripts/smoke.cjs`.

- **Bag after Back.** Safari brings a page back from memory on Back without rerunning `assets/site.js` and sends it no `storage` event. Add a set, tap Back, and the page showed the old bag; the next add then saved over the first item. `site.js` now rereads the bag on `pageshow`. Chrome does deliver the `storage` event, so only Safari shows this.
- **“Women’s drop” links.** `#drop` is now an empty `.drop-anchor` just above `#sets`, and CSS moves it to the top of the wall while `html.world` is set. Since the Crown Set went in above the sets, those links landed on it whenever the 3D was off.
- **Skip link.** iOS 26 draws the page under the status bar, so the link showed behind the clock. It is now also transparent until focused.
- **404.** GitHub Pages serves `404.html` at the address asked for, and one folder deep its relative links break (no styles, dead buttons). The page now moves such addresses to `/404.html` and is `noindex`.
- The enlarge window’s placeholder photo loads lazily (it was 70 KB on every page), printed-set photos carry the AI note when enlarged, and the phone buy bar is an `<aside>`.

Testing notes: Playwright turns the back/forward cache off unless launched with `ignoreDefaultArgs: ['--disable-back-forward-cache']`. Safari keeps using scripts from `python3 -m http.server` for hours because that server sends no cache headers, so check a changed script in Safari on a port it has not loaded before.

## The Wake-Up Call — 2026-11-10

The owner asked to be surprised with a design. The homepage’s “Our world” section (`#story`) kept its words and gained an alarm clock that runs on each visitor’s own time. `wakeSection` in `scripts/build.mjs` writes it, `assets/alarm.js` drives it (homepage only), and its styles sit under “the wake-up call” in `assets/style.css`.

- Snooze runs the display nine minutes ahead, stamps “U LOSE.”, and changes the line under the clock. After three snoozes the button is spent. The third line quotes `drop.totalSets` from the catalog, so it stays true.
- Wake up rewinds to the real time and shows links to `#drop` and `#crown`. “Set it again” starts over.
- The line under the clock changes with the hour (six greetings in `alarm.js`). The label shows the visitor’s time zone, not a city, because the zone’s city is often not theirs.
- The digits are SVG polygons the build draws twice: once upright, once mirrored for the floor reflection. `alarm.js` lights both sets.
- Without JavaScript the clock rests at 6:00 and “Wake up” is a plain link to the drop. With reduced motion nothing shakes or rolls. The clock only ticks while it is on screen.

## Crown Set Photos — 2026-11-11

The owner asked for “the new photos on the new fit page.” The new photos are four AI images of the Charcoal Crown Set made in the owner’s Higgsfield account on 2026-11-10 (`nano_banana_flash`, from the real photos): night street front (an edit of the real front photo), night street back, crest close-up, and flat lay. They now lead the `#crown` section: `headliner.photos` in `assets/catalog.js`, files `assets/images/crown-set-night-front|night-back|crest|flatlay.webp`, sources in `site-photos/crown-generated/`. The owner’s four real photos moved to `headliner.real` and sit in a labeled row underneath, because the night lighting makes the charcoal read darker and bluer than it is. Every tile is tagged “AI image” or “Real photo” and opens larger on tap.

Seven JPGs in Downloads from the same evening are family photos, not SUL. Fourteen images uploaded to Higgsfield on 2026-11-11 are Instagram slides with printed text, not site photos.
