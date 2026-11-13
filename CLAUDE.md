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

The owner launched the women’s drop (`drop.status` is `'live'`). Sets show Available now and add to the bag. Checkout in the bag gives one Stripe link per style that has a **live** Payment Link, with sizes and quantities passed as `client_reference_id` (for example `black-set_2XL-1_L-2`), and one prefilled email order to sulcollective@gmail.com for everything else. Test-mode links (`buy.stripe.com/test_…`) are never shown to customers; `isLiveCheckout` in `assets/catalog.js` decides. Since 2026-11-11 the build makes these links itself (see “Automatic Stripe Links” below); every style on sale has one. Stock is not decremented automatically: set a size to 0 in `stock` and rebuild when it sells out.

## Storefront Polish — 2026-11-05

The bag caps each set at its per-size `stock` (`maxQuantity` in `assets/catalog.js`), so set a size to 0 when it sells out and rebuild; the size then leaves the page and any saved bags. `_config.yml` excludes internal files from the Jekyll build so they are not served on snoozeulose.com; add new internal files to it. The repository itself is public, so anything committed is still readable on GitHub. The Olive set page leads with three AI concept images (`renders` in the catalog, `olive-render-*.webp`), labeled on the page; cards and link previews still use the campaign crop, and sets without `renders` show only the campaign photos. Link previews are covered under “Link Previews” below. The set photos are small crops of one 1254px campaign image, so the set gallery is capped at 480px on desktop until individual photos exist.

## Design Pass — 2026-11-05

A pass against the Design plugin skills, `ui-ux-pro-max`, and `skills/` changed the storefront without changing the brand. The hero leads with the women’s campaign image (what is for sale), and the drop section no longer repeats it. The site header is sticky and tucks away on scroll down. Phones get a fixed buy bar on product and set pages (`buyBar` in `scripts/build.mjs`, wired at the end of `assets/site.js`), hidden while the page’s own add button or the footer is on screen. Small text moved up one step, targets are 44px, and color literals became tokens in `:root` (`--wine` is now `--blue`; `.button.wine` is now `.button.blue`). Fonts load from Latin-subset WOFF2 files with the TTFs as fallback. Printed-set photos are 900px wide. The Full Kit card uses the mannequin photo so it no longer repeats the Blackout Hoodie photo. The `ui-ux-pro-max` generated design system (webinar pattern, Syne, orange CTA) was rejected because it conflicts with the owner’s brand.

The owner removed the crown hoodie sample photo on 2026-11-05 (“this is horrible remove this photo”), along with the logo crop made from it. Do not put it back. It remains readable in the public repository’s git history.

## 3D Redesign — 2026-11-05

The owner rejected the flat, square look and asked for 3D that is “wow like no other.” `DESIGN.md` is rewritten for it and overrides the Design Pass above where they differ (the header is now a floating pill that tucks only during the homepage flight).

- `src/world.js` is the homepage Three.js scene, bundled to `assets/world.js`. `src/motion.js` (Lenis smooth scroll, card tilt, magnetic buttons, world loader) is bundled to `assets/motion.js`. Both bundles are committed because GitHub Pages does not build. Do not edit them by hand.
- `html.world` is set by an inline gate in `<head>` on the homepage (WebGL2, no reduced motion, no save-data). Since 2026-11-11 `world.js` steps quality down on slow frames (under about 24 fps: bloom, then pixel ratio 1, then 0.75, then the dust) and removes the class to fall back to the static layout only below 12 fps at the lowest step. A phone in Low Power Mode (30 fps) keeps full quality. A lost WebGL context shows the poster and resumes when the context returns; the page goes static only if it stays lost for 6 seconds while on screen. `?world` in the URL turns off the frame-rate fallback while testing.
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

The owner sent real photos of the Charcoal Crown Set (washed charcoal hoodie and joggers, chrome crown crest on the back) and asked to make it the headliner. It sits in `#crown`, right after the 3D wall and before the women's sets, and the hero button points to it. Its data is `headliner` in `assets/catalog.js`, and its photos are `assets/images/crown-set-*.webp`. On 2026-11-11 the owner set it at $160 in S–XL (`headliner.price` and `headliner.sizes`). It now sells as the `crown-set` product: sizes and Add to bag in the `#crown` section (`crownBuy` in `scripts/build.mjs`), a collection card, its own page (`crown-set.html`, gallery from the four AI images in `headliner.photos`), a share photo cropped from the night-street front image, and a Stripe link. Its size chart is the standard US unisex one until the set is measured. The photos arrived at 565px wide, so swap in the full-size originals when they come.

## Reliability Pass — 2026-11-10

Found by using the site on iPhone Safari (iOS 26.5 simulator) and with the 3D off. All covered by `scripts/smoke.cjs`.

- **Bag after Back.** Safari brings a page back from memory on Back without rerunning `assets/site.js` and sends it no `storage` event. Add a set, tap Back, and the page showed the old bag; the next add then saved over the first item. `site.js` now rereads the bag on `pageshow`. Chrome does deliver the `storage` event, so only Safari shows this.
- **“Women’s drop” links.** `#drop` is now an empty `.drop-anchor` just above `#sets`, and CSS moves it to the top of the wall while `html.world` is set. Since the Crown Set went in above the sets, those links landed on it whenever the 3D was off.
- **Skip link.** iOS 26 draws the page under the status bar, so the link showed behind the clock. It is now also transparent until focused.
- **404.** GitHub Pages serves `404.html` at the address asked for, and one folder deep its relative links break (no styles, dead buttons). The page now moves such addresses to `/404.html` and is `noindex`.
- The enlarge window’s placeholder photo loads lazily (it was 70 KB on every page), printed-set photos carry the AI note when enlarged, and the phone buy bar is an `<aside>`.

Testing notes: Playwright turns the back/forward cache off unless launched with `ignoreDefaultArgs: ['--disable-back-forward-cache']`. Safari keeps using scripts from `python3 -m http.server` for hours because that server sends no cache headers, so check a changed script in Safari on a port it has not loaded before.

## The Wake-Up Call — 2026-11-10, moved to the hero 2026-11-11

The owner asked to be surprised with a design: an alarm clock that runs on each visitor’s own time. On 2026-11-11 the owner asked to “put clock at top, integrate it in a dope way,” so it now lives in the homepage hero and “Our world” (`#story`) is words only again (`storySection`). `heroClock` in `scripts/build.mjs` writes it, `assets/alarm.js` drives it (homepage only), and its styles sit under “the wake-up call” in `assets/style.css`.

- Wide screens: the time sits beside “Don’t sleep on style.” as the headline’s timestamp, in the same chrome, and reflects on the hero’s floor line. Its status pill mirrors the “Available now” pill opposite.
- Portrait phones and tablets: the clock sits at the top of the screen, above the 3D logo, like a lock screen. It shrinks on short phones so it clears the logo.
- The clock itself is the snooze button. The hint reads “Snooze if you dare” (the owner thought “Hit snooze” told people to snooze). It never runs out (the owner asked on 2026-11-11 that it always run): after three snoozes the Wake up link joins the pill and the minutes keep counting. The third message, read out to screen readers, quotes `drop.totalSets` from the catalog, so it stays true.
- The owner asked for “something dope” on the tap, then for it to be “more amazing and always able to run in browser and phone” (both 2026-11-11). Each snooze blows the lit segments apart (`shards`) in a spray of sparks drawn on a 2D canvas over the hero (`burst`, `.alarm-sparks`), flashes from the clock (`.alarm-flash`), sends two rings of light across the hero (`.alarm-wave`), glitches the headline, shakes the hero, slams “U LOSE.” down, and puts the digits back nine minutes later. A short smash plays through Web Audio (`smash`; an iPhone on silent stays silent), Android vibrates, and iPhone gets a haptic tick from a hidden switch toggle (`thud`, iOS 18 and later, untested on a real device).
- It also fires `sul:snooze`, and `src/world.js` answers: the 3D logo spins (twice on the third snooze), its chrome flares and ripples, the void flashes blue, the dust blows outward, the type band turns the other way, and the camera punches in and shakes. Without the 3D the poster logo spins instead (`posterKick`), so the blast is the same on every browser. Each snooze hits harder (`power`, capped from the third on).
- Flashes (the clock’s, the 3D void’s, the poster’s flare) come at most once a second however fast the taps, for photosensitive visitors. The hero has `touch-action: manipulation`, because fast taps on the clock made iPhone Safari double-tap zoom. With reduced motion only the time and the stamp change (the sound still plays).
- Any link to `#drop` wakes it: the clock rewinds to the real time behind the link and can be snoozed again.
- The status pill shows the visitor’s time zone, not a city, because the zone’s city is often not theirs.
- The digits are SVG polygons the build draws twice: once upright, once mirrored for the floor reflection. `alarm.js` lights both sets. The AM/PM lamps are drawn by CSS, since the time is read out from `#alarm-time`.
- Without JavaScript the clock rests at 6:00 and does nothing. With reduced motion nothing shakes or rolls. The clock only ticks while it is on screen.

## Crown Set Photos — 2026-11-11

The owner asked for “the new photos on the new fit page.” The new photos are four AI images of the Charcoal Crown Set made in the owner’s Higgsfield account on 2026-11-10 (`nano_banana_flash`, from the real photos): night street front (an edit of the real front photo), night street back, crest close-up, and flat lay. They now lead the `#crown` section: `headliner.photos` in `assets/catalog.js`, files `assets/images/crown-set-night-front|night-back|crest|flatlay.webp`, sources in `site-photos/crown-generated/`. The owner’s four real photos moved to `headliner.real` and sit in a labeled row underneath, because the night lighting makes the charcoal read darker and bluer than it is. Every tile opens larger on tap. On 2026-11-11 the owner had the “AI image” and “Real photo” tags taken off the tiles, then the real-photo row (“The set as the camera saw it”) taken off the page. The four real photos stay in `headliner.real` in the catalog, unused; the AI images still say so in the enlarged view.

Seven JPGs in Downloads from the same evening are family photos, not SUL. Fourteen images uploaded to Higgsfield on 2026-11-11 are Instagram slides with printed text, not site photos.

## Automatic Stripe Links — 2026-11-11

The owner asked that every product get a Stripe link automatically when it is added, for everything on sale. `npm run build` now runs `scripts/stripe-links.mjs` first. For every set and product with a price, it makes a live Stripe product (name, catalog description, the `assets/share/<id>.jpg` photo), a price, and a Payment Link, then saves them in `assets/stripe-links.js`. The catalog reads that file (`withCheckout` in `assets/catalog.js`), so adding a product with a `price` and rebuilding is all it takes. Never edit `stripe-links.js` by hand. Each link takes a US shipping address and a phone number, and lets the buyer set quantity up to the style's total `stock`, or 10 when a style has no stock count. The bag still passes sizes as `client_reference_id`.

It also keeps existing links in step: a price change makes a new price and link and turns the old link off; name, description, or photo changes update the Stripe product; a stock change moves the quantity limit; at 0 stock, or when a style is removed or shelved, the link is turned off. Relisting at the same price turns it back on. A live link pasted into `setCheckout` or a product's `checkout` still wins and is left alone. `npm run stripe -- --dry-run` lists what would change without a key.

- **Account:** Stripe account “SUL” (`acct_1UW4bp2erMeGEpEl`), live mode. The five old `test_` links in the catalog belong to a different account (“Snooze You Lose sandbox”) and are never shown.
- **Key:** read from `STRIPE_SECRET_KEY` or the macOS Keychain item `snoozeulose-stripe` on the owner’s Mac, never from the repository, which is public. Without a key the build changes nothing in Stripe and lists the styles still waiting. The key saved on 2026-11-11 is a full-access live secret key (the dashboard’s restricted-key step needed a verification the built-in browser could not pass). It should be replaced with a restricted key named “snoozeulose.com build (payment links)” with Products, Prices, and Payment Links set to Write and nothing else, saved with `security add-generic-password -U -a "$USER" -s snoozeulose-stripe -w`.
- **Links made 2026-11-11:** all nine styles on sale (the four sets, four older products, and the Crown Set), in `assets/stripe-links.js`. The payment page shows the business as “Snooze You Lose”.
- **Not set up:** sales tax (Stripe Tax is off on these links, and the account’s tax settings are unfinished), and product photos for styles without a share image. The five printed shirt-and-shorts sets stay studio previews with no price (owner, 2026-11-11), so they have no link. The Stripe CLI on this Mac is logged in to ClaimStation, not SUL, so do not use it here.

## Instagram Stories and Posts — 2026-11-12

The owner asked to “set up the ig to post stories and everything.” Instagram (@thesulcollective) is connected to Metricool (brand `thesulcollective`, time zone America/New_York), and Claude schedules posts and stories through the Metricool connector. No Metricool or Instagram key is kept in the repository.

- `npm run stories` (`scripts/social/build_stories.mjs`; needs Chrome and `SUL_PLAYWRIGHT_PATH`, no preview server) draws the stories: one 1080x1920 JPEG each in `assets/stories/`, in the site’s type and colors, matching the first story the owner queued by hand on 2026-11-11. There are 13: four for the Crown Set, the four-colorway lineup, one per women’s set, and one per older product. `SPECS` in the script holds each story’s photo and words; its order is the posting order.
- Prices, sizes, and counts are read from `assets/catalog.js`, so rerun it after a catalog change. A set shows “7 made” until some sell, then “4 left”; a style with no size left loses its story and its file; the lineup counts only colorways still on sale. A style added to the catalog later gets a plain story from its share photo without touching `SPECS`.
- Instagram covers the top 270px of a story with its header and the bottom 380px with the reply bar, so the words sit between them. The empty band at the bottom is on purpose.
- `assets/stories/stories.json` lists each story’s public image address, product link, alt text, and `ai`. Every photo used is a Higgsfield image, so every story is `ai: true` and is scheduled with Instagram’s AI label on (`isAiGenerated`).
- To schedule: Metricool fetches the image from its public address, so the file has to be on `main` (`https://snoozeulose.com/assets/stories/<id>.jpg`) first. Schedule it as an Instagram `STORY` with no text. Metricool’s own best hours for this account are 10 am to noon and 5 to 7 pm Eastern.
- A story Metricool publishes by itself cannot carry a link sticker, poll, or music; Instagram does not allow them through outside apps. That is why the address is printed on the image. For a tappable link, schedule with `autoPublish: false`: Metricool then sends the story to the owner’s phone to add the sticker and post by hand.
- `npm run posts` (`scripts/social/build_posts.mjs`, same requirements) draws the feed posts: carousels of 1080x1350 JPEGs, `assets/posts/<post>-<n>.jpg`. The owner answered the story plan with “story and regular posting” (2026-11-12), so the feed is part of the setup. The slides follow the two carousels the owner queued by hand on 2026-11-11: a cover with a chrome headline, a closer photo with one line, a facts slide, and a closing slide that points to the site. `POSTS` in the script holds each post’s slides and caption; its order is the posting order. There are nine: the Crown Set night photos, one per women’s set, one for the four older black pieces, and three made on 2026-11-13 (the owner’s “Yes, make them”) because a carousel may only rerun after 28 days, which left no feed posts from Nov 26 to Dec 11. The three are a gift guide (`gift-guide`: every style in price bands, with the older pieces’ product photos rather than their AI model shots), a size guide (`size-guide`: the owner’s fit notes, how to measure, and each chart cut to the sizes still for sale, with a note for a size only some styles have), and a studio preview of the five printed sets (`print-preview`: labeled “Not for sale yet” with no price, as on the homepage; their names and colors are copied from the “Make some noise” list in `scripts/build.mjs`, so change both together). `scripts/social/kit.mjs` holds what the two builders share.
- `assets/posts/posts.json` lists each post’s caption, its slide addresses in order, alt text per slide, and product link. Captions take price, sizes, and counts from the catalog, and a post whose styles have all sold out is dropped with its files. To schedule one: an Instagram `POST` with the slide addresses as `media` in order, the caption as `text`, the alt list as `mediaAltText`, and the AI label on.
- The olive set’s three concept renders (`olive-render-*.webp`) are left out of its post: their light backdrop and different models break the dark look of the rest of the feed.
- Queued 2026-11-12 on the owner’s yes: the 13 stories, two a day from Nov 13 to Nov 19 (noon and 6 pm Eastern; Sat 11 am, Sun 7 pm). The owner also approved the six feed posts that day for 5 pm Eastern on Nov 14, 17, 19, 21, 23, and 25, in `POSTS` order, and on 2026-11-13 the three new ones for 5 pm on Nov 27 (gift guide), Nov 30 (size guide), and Dec 4 (printed sets).
- `scripts/social/queued.json` is the log of everything queued (time, `story` or `post`, id; ids starting `owner:` are the owner’s own posts). Append to it whenever something is queued.
- **Weekly plan.** At the owner’s request (2026-11-12) a scheduled task in the Claude app, “SUL Instagram: weekly plan” (`sul-instagram-weekly`, prompt in `~/.claude/scheduled-tasks/sul-instagram-weekly/SKILL.md`), runs every Wednesday at 10 am. It works in its own `ig-weekly-<date>` worktree from `origin/main`, redraws the stories and posts from the catalog, reads the Metricool queue and `queued.json`, plans the coming Friday to Thursday (two stories a day; a feed post at most every other day, and a carousel returns only 28 days after its last run, with a rewritten caption), and sends the owner one image of the week from `scripts/social/plan_sheet.mjs`. It queues nothing until the owner says yes in that run’s conversation; then it merges the redrawn images and the log to `main`, waits for the site to serve them, and schedules. It only runs while the Claude app is open (a missed run happens at the next launch), and it was saved in Bypass permissions mode, so the yes in the prompt is the only gate.
- Redrawing a story or post overwrites the file at the same address. Items already queued are not affected, because Metricool keeps its own copy of each image from the moment it is scheduled.
- Publishing is the owner’s call each time. Show the stories or posts and the dates, and queue them only on a yes.
