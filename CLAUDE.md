# SUL — Snooze U Lose

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
