// S.U.L. Women's Collection — first drop.
// Edit this file (not the generated HTML) and run `npm run build`.
//
// womensStatus controls the whole collection:
//   'coming-soon'  pages show launch pricing, the size guide, and a disabled
//                  "Coming soon" action. Nothing can be added to the bag.
//   'live'         size buttons follow the inventory counts below, the
//                  "Add to bag" action works, and each look needs a Stripe
//                  Payment Link in `checkout` before the bag can hand off.
export const womensStatus = 'coming-soon';

export const womensSizes = ['XS', 'S', 'M', 'L', 'XL'];

// Body measurements in inches. Confirm against production samples before launch.
export const womensSizeChart = [
  { size: 'XS', us: '0–2', bust: '31–32', waist: '24–25', hip: '34–35' },
  { size: 'S', us: '4–6', bust: '33–34', waist: '26–27', hip: '36–37' },
  { size: 'M', us: '8–10', bust: '35–36', waist: '28–29', hip: '38–39' },
  { size: 'L', us: '12–14', bust: '38–40', waist: '31–33', hip: '41–43' },
  { size: 'XL', us: '16–18', bust: '41–43', waist: '34–36', hip: '44–46' }
];

// The four looks. Every colorway carries all four, so 4 × 4 = 16 complete outfits.
// Prices are launch pricing drafted for owner confirmation.
export const womensLooks = [
  {
    key: 'crown-set', number: '01', name: 'The Crown Set', price: 110,
    pieces: ['Fitted crown crop top', 'Sculpting high-rise leggings'],
    fit: 'Sculpting fitted silhouette',
    description: 'The signature crown at the chest, a sculpting high-rise legging below. Fitted from top to hem so the silhouette does the talking.'
  },
  {
    key: 'oversized-set', number: '02', name: 'The Oversized Set', price: 120,
    pieces: ['Oversized crown sweatshirt', 'Fitted bike short'],
    fit: 'Oversized top, fitted short',
    description: 'A dropped-shoulder crown sweatshirt over a fitted bike short. Weekend proportions with the SUL attitude intact.'
  },
  {
    key: 'pleated-set', number: '03', name: 'The Pleated Set', price: 115,
    pieces: ['Fitted crown tank', 'Pleated mini skirt'],
    fit: 'Fitted top, pleated skirt',
    description: 'A fitted crown tank with a sharp pleated mini. Clean lines up top, movement below. Built for the days that run long.'
  },
  {
    key: 'knit-set', number: '04', name: 'The Knit Set', price: 135,
    pieces: ['Premium-inspired knit cardigan', 'Matching knit midi skirt'],
    fit: 'Relaxed knitwear',
    description: 'Premium-inspired knitwear, head to toe. A relaxed cardigan with the crown at the hip and a matching midi skirt. The softest statement in the drop.'
  }
];

// Per-size stock for every look in every colorway. Fill these in from the
// inventory count before switching womensStatus to 'live'. 0 renders as sold out.
const noStock = () => Object.fromEntries(womensSizes.map((size) => [size, 0]));
const emptyInventory = () => Object.fromEntries(womensLooks.map((look) => [look.key, noStock()]));

export const womensColorways = [
  {
    id: 'womens-olive-luxe', slug: 'olive-luxe', name: 'Olive Luxe', category: 'Women',
    colors: { base: '#4f5b3f', tone: '#6b7757', accent: '#d8d2b8', text: '#f2f0e8', toneText: '#f2f0e8' },
    tagline: 'Earth tones. Sharp intent.',
    description: 'Deep olive with a stone-toned crown. The colorway that reads quiet across the room and sharp up close. All four looks, cut in the same olive so every piece pairs with every other.',
    details: [['Includes', 'Four complete looks, two pieces each'], ['Sizes', 'XS – XL'], ['Crown', 'Stone crown detail on every top'], ['Fabric', 'Confirmed at launch']],
    inventory: emptyInventory(),
    checkout: {}
  },
  {
    id: 'womens-navy-cream', slug: 'navy-cream', name: 'Navy & Cream', category: 'Women',
    colors: { base: '#1f2b4d', tone: '#ece4d3', accent: '#c9bfa6', text: '#f4efe4', toneText: '#1f2b4d' },
    tagline: 'Two tones. One standard.',
    description: 'Navy tops over cream bottoms, with the crown picked out in cream. The most collegiate colorway in the drop, built to be split up and worn with everything you already own.',
    details: [['Includes', 'Four complete looks, two pieces each'], ['Sizes', 'XS – XL'], ['Crown', 'Cream crown detail on navy'], ['Fabric', 'Confirmed at launch']],
    inventory: emptyInventory(),
    checkout: {}
  },
  {
    id: 'womens-midnight-black', slug: 'midnight-black', name: 'Midnight Black', category: 'Women',
    colors: { base: '#15171c', tone: '#23262d', accent: '#a7adb8', text: '#ededf0', toneText: '#ededf0' },
    tagline: 'After hours. All hours.',
    description: 'Black on black with a silver crown. The core SUL colorway carried into the women’s line: fitted, oversized, pleated, and knit, every piece in the same midnight black.',
    details: [['Includes', 'Four complete looks, two pieces each'], ['Sizes', 'XS – XL'], ['Crown', 'Silver crown detail on every top'], ['Fabric', 'Confirmed at launch']],
    inventory: emptyInventory(),
    checkout: {}
  },
  {
    id: 'womens-blush-pink', slug: 'blush-pink', name: 'Blush Pink', category: 'Women',
    colors: { base: '#e3bfc4', tone: '#f0d9dc', accent: '#7f525a', text: '#3b2b2f', toneText: '#3b2b2f' },
    tagline: 'Soft color. Loud presence.',
    description: 'A dusted blush with a deep rose crown. The lightest colorway in the drop and the one that stands out furthest on the street. Same four looks, softer palette.',
    details: [['Includes', 'Four complete looks, two pieces each'], ['Sizes', 'XS – XL'], ['Crown', 'Rose crown detail on every top'], ['Fabric', 'Confirmed at launch']],
    inventory: emptyInventory(),
    checkout: {}
  }
];

// One shoppable record per outfit (16 in total). The bag and quick view read these.
export const womensOutfits = womensColorways.flatMap((colorway) => womensLooks.map((look) => ({
  id: `${colorway.id}-${look.key}`,
  name: `${look.name}`,
  colorwayId: colorway.id,
  page: `womens-${colorway.slug}.html`,
  colorwayName: colorway.name,
  lookKey: look.key,
  price: look.price,
  category: 'Women',
  color: colorway.name,
  image: `womens/${colorway.slug}-${look.key}.svg`,
  scene: `womens/${colorway.slug}.svg`,
  alt: `${look.name} in ${colorway.name}: ${look.pieces.join(' and ').toLowerCase()}. Studio preview, photography to follow.`,
  sceneAlt: `${colorway.name} colorway card for the SUL women’s collection`,
  sizes: womensSizes,
  pieces: look.pieces,
  description: look.description,
  inventory: colorway.inventory[look.key],
  checkout: colorway.checkout[look.key] || null
})));

export const womensSummary = {
  colorways: womensColorways.length,
  outfits: womensOutfits.length,
  priceFrom: Math.min(...womensLooks.map((look) => look.price)),
  priceTo: Math.max(...womensLooks.map((look) => look.price))
};
