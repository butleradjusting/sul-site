---
name: "SUL — Snooze U Lose"
description: "A royal-blue and graphite storefront for SUL garments and studio material."
colors:
  royal-blue: "#204cad"
  deep-blue: "#183877"
  chalk: "#eeeef0"
  ink: "#111315"
  muted: "#626670"
  concrete: "#dcdde0"
  line: "#b9bdc5"
  blue-mist: "#a4b9e8"
  blue-text: "#ccd6ef"
  silver-text: "#c1c5ce"
typography:
  display:
    fontFamily: "Barlow, sans-serif"
    fontSize: "clamp(64px,7vw,96px)"
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: "-.025em"
  headline:
    fontFamily: "Barlow, sans-serif"
    fontSize: "clamp(44px,5.5vw,80px)"
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: "-.025em"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  control-label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.6
  action-label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.6
spacing:
  page: "clamp(20px,4.2vw,76px)"
  "12": "12px"
  "20": "20px"
  "24": "24px"
  "28": "28px"
  "30": "30px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.chalk}"
    typography: "{typography.action-label}"
    padding: "16px 23px"
  button-primary-hover:
    backgroundColor: "{colors.royal-blue}"
  button-light:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.royal-blue}"
    typography: "{typography.action-label}"
    padding: "16px 23px"
  button-light-hover:
    backgroundColor: "#d6dae3"
  button-blue:
    backgroundColor: "{colors.royal-blue}"
    textColor: "{colors.chalk}"
    typography: "{typography.action-label}"
    padding: "16px 23px"
  button-blue-hover:
    backgroundColor: "{colors.deep-blue}"
  navigation:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.chalk}"
    typography: "{typography.control-label}"
  sort-select:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "0"
    padding: "10px 18px 10px 5px"
  product-card:
    textColor: "{colors.ink}"
    typography: "{typography.control-label}"
  product-media:
    backgroundColor: "{colors.concrete}"
  product-tag:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.ink}"
    typography: "{typography.control-label}"
    padding: "5px 8px"
  size-choice:
    textColor: "{colors.ink}"
    padding: "12px 15px"
  size-choice-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.chalk}"
  image-view:
    textColor: "{colors.muted}"
    typography: "{typography.control-label}"
    padding: "9px 13px"
  image-view-selected:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.ink}"
  studio-choice:
    textColor: "{colors.blue-text}"
    padding: "25px 0"
  studio-choice-selected:
    textColor: "{colors.chalk}"
---

# Design System: SUL — Snooze U Lose

## Overview

**Creative North Star: "The After-Hours Storefront"**

The After-Hours Storefront describes the built relationship between graphite architectural fields, royal blue, cool silver, condensed lettering, and supplied garment photography. SUL’s wordmark, lion crest, and “Don’t Sleep On Style” remain the identity anchors. Large headings carry the attitude; quiet product information makes browsing legible.

This is the first code-based interpretation of the supplied chrome/blue studies and clothing photographs. The descriptive language is inferred from the implementation, not an assertion of owner aesthetic approval. The system alternates dark campaign fields with light merchandising space, using portrait imagery and generous gutters rather than decorative cards.

**Key Characteristics:**

- Royal blue with graphite and cool silver.
- Condensed uppercase display type beside quiet Manrope details.
- Square controls and unboxed portrait merchandising.
- Flat surfaces, tonal depth, and brief tactile motion.

## Colors

Royal blue and graphite frame a cool, silver-toned merchandising surface. The frontmatter holds the observed reusable values; component-only colors remain in their component definitions.

### Primary

- **Royal Blue** drives primary purchase actions, studio selectors, the mobile menu, and large brand fields. Its source variable retains the legacy name `wine`.
- **Deep Blue** is the darker hover state for royal-blue actions; its source name is `wine-deep`.
- **Blue Mist** provides light display accents on dark fields. **Blue Text** supports secondary copy on blue and graphite.

### Neutral

- **Chalk** is the page and light-control surface; **Ink** carries text and dark architectural fields.
- **Concrete** sits behind garment media; **Line** separates product details and controls.
- **Muted** supports secondary information on light surfaces. **Silver Text** supports secondary information on dark surfaces.

**The Garment First Rule.** Use supplied garment imagery as the focal material; keep merchandising furniture quiet.

## Typography

**Display Font:** Barlow Condensed, registered in CSS as `Barlow`, with a sans-serif fallback. **Body Font:** Manrope, with a sans-serif fallback.

The condensed uppercase face supplies the block-letter character. Manrope handles product names, descriptions, prices, and controls. The frontmatter records the global hierarchy; individual campaign, product, and dialog headings adapt that hierarchy to their space. Product-card names use the compact control scale rather than the global title scale. Prices and counts use tabular numerals.

**The Two Voices Rule.** Use the condensed face for display statements and Manrope for product facts and controls.

## Layout

The shared shell centers content within a maximum width (1800px) and uses the page gutter token. Repeated spacing entries record observed gaps and padding, not a newly imposed modular scale. Desktop campaign sections pair copy and media in two columns. The home product row uses four columns; collection and related-product rows use three. Portrait product media uses a two-to-three frame.

At the intermediate breakpoint (1100px), gutters tighten (32px), display sizes and major gaps adjust, and the brand’s secondary lettering hides. At the mobile breakpoint (767px), the gutter becomes compact (22px), the header shortens (78px), navigation moves to a full-screen menu, campaign and product-detail layouts stack, and merchandise becomes two columns. Product summaries stop sticking. Filters scroll horizontally, and printed sets use a snap-scrolling row. Ultra-wide treatment begins at the large breakpoint (1800px).

Mobile body copy uses a larger reading scale, while campaign and collection headings shrink fluidly on narrow screens. Shopping controls provide a minimum touch area (44px); this treatment also applies to coarse pointers. Quick-view close controls stay above scrolling content. The bag footer has its own constrained scroll area so checkout links remain reachable on short screens.

## Elevation & Depth

The system has no box shadows. It uses graphite, blue, chalk, and concrete fields, thin separators, photo overlap, and image cropping for depth. Dialogs sit over a translucent dark backdrop with a modest blur (4px); the bag slides from the right. Header, dialog, and feedback layers remain distinct. Depth and motion values are recorded in the sidecar.

**The Flat Surface Rule.** Use tonal fields, separators, and overlap for depth; the built system has no box shadows.

## Shapes

Rectangular image crops, square controls, fine rules, and unboxed product metadata are the recurring language. Borders distinguish size choices and information rows. The circular product-color swatch is a functional exception, not a shared corner system. No reusable radius scale is declared in the source, so none is invented here.

## Components

### Buttons

Solid, square actions pair concise Manrope labels with inline stroke icons. Ink, light, and royal-blue variants share padding and alignment. Hover changes the fill, keyboard focus uses a current-color outline, and pressed controls shift down slightly. The light variant serves dark fields; royal blue supplies product and bag actions.

### Tags and Selection Controls

The three-piece-set tag reports garment content; it is not a heading eyebrow. Filters and printed-set choices use underline selection. Size choices use an outline at rest and an ink fill when selected. The Studio / Styled switch uses a chalk selected segment within a cooler container. Selected state is represented with `aria-pressed`, and the actual image is swapped after loading.

### Cards and Media

Product cards are portrait photographs with a square quick-view control, compact information below, and a separate price. On pointer hover, the photograph eases inward and the alternate photograph can appear; mobile retains explicit Studio / Styled control. Gallery thumbnails use opacity and a blue selection rule. Studio selectors reveal an arrow on the selected or hovered row. Printed sets have their own shirt/shorts choices and image enlargement.

### Inputs and Fields

The implemented form control is the native collection sort select, with a transparent fill and square outline geometry. Size errors sit beneath the choices and focus returns to a size button when a choice is required. The bag’s quantity controls have explicit disabled limits. No text-input or newsletter-field pattern exists in this build.

### Navigation and Dialogs

The desktop header is an unboxed dark row with wordmark, navigation, and bag action. Hover and current-page state reveal a thin underline. Mobile uses a royal-blue full-screen dialog with condensed destination labels. Product quick view, image enlargement, and the bag use native dialogs with visible close controls. The bag persists locally and keeps test checkout disclosure visible.

### Motion

One entrance sequence settles the hero image while the headline rises into place. Subsequent motion is localized to image swaps, slight media scale, icon response, and dialogs. Reduced-motion preference disables animations and transitions and removes the product-image hover transform. Exact durations and easing are sidecar extensions.

## Do's and Don'ts

### Do:

- **Do** retain SUL’s supplied identity assets and actual garment photographs.
- **Do** use the condensed display hierarchy with restrained Manrope product information.
- **Do** retain visible selected states, keyboard focus, and reduced-motion behavior.
- **Do** keep studio previews and test checkout status explicit wherever those states apply.

### Don't:

- **Don’t** introduce rounded cards or shadows into the existing flat, square component vocabulary.
- **Don’t** make small promotional eyebrows a reusable heading pattern.
- **Don’t** treat the studio studies as confirmed sale inventory or imply live checkout.
