---
name: "SUL — Snooze U Lose"
description: "An after-hours 3D storefront in liquid chrome and royal blue."
colors:
  void: "#05070d"
  ink: "#0a0e18"
  raise: "#121725"
  raise-2: "#1a2133"
  chalk: "#f2f4f9"
  silver: "#c8cfdd"
  muted: "#9aa3b6"
  royal-blue: "#204cad"
  deep-blue: "#183877"
  electric-blue: "#4d7dff"
  blue-mist: "#a9bff2"
  blue-text: "#cfd9f2"
  live: "#c9f24f"
typography:
  display:
    fontFamily: "Barlow, sans-serif"
    fontSize: "clamp(52px,9.3vw,176px)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-.018em"
  headline:
    fontFamily: "Barlow, sans-serif"
    fontSize: "clamp(44px,5.8vw,92px)"
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: "-.018em"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.45
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  s: "12px"
  m: "20px"
  l: "32px"
  pill: "999px"
spacing:
  page: "clamp(20px,4.2vw,76px)"
components:
  button-light:
    backgroundColor: "{colors.chalk}"
    textColor: "#0a1330"
    rounded: "{rounded.pill}"
  button-blue:
    backgroundColor: "{colors.royal-blue}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
  button-ghost:
    backgroundColor: "{colors.raise-2}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.pill}"
  product-media:
    backgroundColor: "{colors.raise}"
    rounded: "{rounded.m}"
  dialog:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.l}"
---

# Design System: SUL — Snooze U Lose

## Overview

**Creative North Star: "After Hours, In Chrome"**

The owner asked for something 3D and "wow like no other" after rejecting the flat, square system. The homepage is one continuous 3D world. A chrome SUL logo, made from the real wordmark, hangs in the dark with a band of type around it. Scrolling flies the camera through the U into a flash of royal blue, then to a curved wall where each colorway has its own lit room. The other pages carry the same material language without loading the 3D, so they stay fast.

Direction came from research into streetwear and luxury 3D sites: selling one object properly, one room per product, liquid chrome, kinetic type, and motion tied to scroll.

## The World

- **Act 1, the logo.** `assets/3d/sul-logo.bin` is the wordmark inflated in Blender, with analytic normals so reflections stay smooth at 87 KB. Reflections come from a generated light-band studio, and a shader ripples them like liquid metal. It follows the pointer and ripples under it.
- **The flight.** Scrolling through the hero moves the camera through the gap in the U while the field of view widens, then floods the frame with royal blue.
- **Act 2, the wall.** Each set hangs as a cloth panel on a curve around the viewer, with a floor reflection and a room light in its own colorway. Scrolling turns the wall, dwelling on each set. Fast scrolling bends the cloth and splits color slightly. Details sit beside the panel on desktop and below it on phones.
- **Then the shop.** The canvas fades and stops rendering. The full set grid and everything else is ordinary DOM.

**The True Color Rule.** The renderer has no tone mapping, so garment photographs keep their real color. Effects may touch them only while they move.

**The Shopping First Rule.** The hero is readable before any 3D loads, and every action on the wall is a real link or button. If WebGL is missing, reduced motion is on, save-data is on, or frames stay slow, the page falls back to the poster and the normal grid. Quality steps down before that happens: bloom off, then resolution down.

## Colors

Near-black with a blue cast, cool silver, and royal blue. **Lime** appears only as the live-status dot, echoing the owner's chrome and blue garment studies. The wall's room lights are per colorway (`glowFor` in `scripts/build.mjs`).

## Typography

Barlow Condensed for display, Manrope for everything else. Display type in `main` is filled with the chrome gradient, falling back to solid chalk where text clipping is unsupported. Where scroll-driven animation is supported, the metal slides as a heading moves through the viewport. Prices and counts use tabular numerals. The smallest text is 12 to 13px labels; body copy is 15px.

## Shape and Depth

Soft radii and pills replace the square vocabulary. Depth is real here: inner hairlines, a top highlight on buttons, colored glow under primary actions, glass on floating controls, and perspective tilt on photos.

## Components

- **Header.** A floating glass pill. It tucks only on the way down during the homepage flight, so the bag is always reachable elsewhere.
- **Buttons.** Pills that lean slightly toward the pointer. Light for the main action on dark, royal blue for buying, ghost for secondary.
- **Cards and galleries.** Rounded photos that tilt toward the pointer with light following it. Card images morph into the product page gallery through a cross-document view transition where supported.
- **Selection.** Filters, tabs, and shirt/shorts switches are pills that turn chalk when selected. Sizes are rounded chips with a soft glow.
- **Dialogs.** Dark rounded panels over a blurred scrim. The bag floats in from the right.
- **Phones.** A fixed glass buy bar on product pages, hidden while the page's own add button or the footer is on screen. Targets are at least 44px.
- **Marquee.** A slightly tilted royal-blue band of moving type between the wall and the set grid.
- **Logo marks.** Header and footer use the traced vector as a mask over a chrome gradient, so they stay crisp at any size.
- **The wake-up call.** The brand name as an object: a live alarm clock in the homepage hero, on the visitor’s own time. Chrome seven-segment digits lean like the wordmark and reflect on the hero’s floor line. On wide screens the time is the headline’s timestamp; on portrait screens it sits at the top like a lock screen. The clock is the snooze button, and it never runs out. Each tap blows the digits into chrome shards and sparks, flashes, sends a shockwave through the hero, glitches the headline, knocks the 3D logo into a spin (the poster logo when the 3D is off), stamps U LOSE with a smash you can hear, and reassembles the digits nine minutes later. It hits harder up to the third snooze, which spins the logo twice. Any link to the drop wakes it.

## Motion

Lenis smooth scroll on mouse and trackpad only; phones keep native scroll. Reduced motion removes all of it, including the 3D. Animate transform and opacity, not layout.

## Do's and Don'ts

### Do:

- **Do** use real SUL garments and the real wordmark.
- **Do** keep the studio preview, AI concept, and checkout labels visible and truthful.
- **Do** test every change at 320px, with reduced motion, and with WebGL off.

### Don't:

- **Don't** tone-map, recolor, or permanently distort garment photos.
- **Don't** put required shopping information only in the canvas.
- **Don't** load `world.js` on anything but the homepage.
- **Don't** bring back the crown hoodie sample photo or the shelved bomber without the owner's say.
