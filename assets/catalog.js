export const products = [
  {
    id: 'blackout-hoodie', name: 'Blackout Hoodie', price: 85, category: 'Tops',
    color: 'Black / White', image: 'hoodie', scene: 'hoodie-scene',
    alt: 'Black SUL hoodie with white lettering on both sleeves',
    sceneAlt: 'Blackout Hoodie and SUL cap styled on a store mannequin',
    gallery: ['hoodie', 'hoodie-scene'], sizes: ['S', 'M', 'L', 'XL', '2XL'],
    description: 'All black. All SUL. A heavyweight hoodie with bold white sleeve lettering, a relaxed silhouette, and a kangaroo pocket. An everyday piece with a presence of its own.',
    details: [['Material', 'Heavyweight cotton fleece'], ['Fit', 'Oversized / Relaxed'], ['Details', 'Kangaroo pocket, ribbed cuffs'], ['Color', 'Black / White sleeve print']],
    checkout: 'https://buy.stripe.com/test_fZu9AV1RyfBa6WB5rX1kA00'
  },
  {
    id: 'bomber-jacket', name: 'Bomber Jacket', price: 125, category: 'Outerwear',
    color: 'Black / Embroidered', image: 'bomber', scene: 'bomber-scene',
    alt: 'Black SUL bomber jacket with outlined chest embroidery and shoulder patches',
    sceneAlt: 'SUL bomber jacket styled in a warmly lit storefront',
    gallery: ['bomber', 'bomber-scene'], sizes: ['S', 'M', 'L', 'XL', '2XL'],
    description: 'The piece that pulls the whole look together. A black satin bomber with SUL chest embroidery, custom patches, and ribbed finishing. Zip it up. Step out.',
    details: [['Material', 'Satin shell / Polyester lining'], ['Fit', 'Regular / True to size'], ['Details', 'Full zip, embroidered patches, interior pocket'], ['Finishing', 'Ribbed collar and cuffs']],
    checkout: 'https://buy.stripe.com/test_14A9AVdAgcoY5Sx8E91kA01'
  },
  {
    id: 'lion-sweater', name: 'Lion Sweater', price: 95, category: 'Tops',
    color: 'Black / White', image: 'sweater', scene: 'sweater-scene',
    alt: 'Black crewneck sweater with outlined SUL lettering and embroidered lion crest',
    sceneAlt: 'SUL sweater displayed in a glass storefront',
    gallery: ['sweater', 'sweater-scene'], sizes: ['S', 'M', 'L', 'XL', '2XL'],
    description: 'The lion takes its place. A heavyweight knit crewneck with the signature embroidered crest above outlined SUL lettering. Relaxed, substantial, and ready to layer.',
    details: [['Material', 'Heavyweight knit cotton blend'], ['Fit', 'Relaxed / Oversized'], ['Details', 'Embroidered lion crest'], ['Finishing', 'Ribbed collar, cuffs, and hem']],
    checkout: 'https://buy.stripe.com/test_6oU5kFao42Oo2Gl1bH1kA02'
  },
  {
    id: 'new-era-hat', name: 'New Era Trucker Hat', price: 45, category: 'Accessories',
    color: 'Black / White', image: 'hat', scene: 'hat-side',
    alt: 'Black SUL cap with raised white front embroidery',
    sceneAlt: 'Side view of the SUL New Era cap showing the side flag and mesh panels',
    gallery: ['hat', 'hat-side'], sizes: ['One size'],
    description: 'Finish the look. A black mesh trucker cap with raised SUL embroidery, the New Era side flag, and an adjustable snapback closure.',
    details: [['Brand', 'SUL × New Era'], ['Style', 'Trucker / Mesh back'], ['Closure', 'Adjustable snapback'], ['Details', '3D embroidery, New Era side flag']],
    checkout: 'https://buy.stripe.com/test_bJe5kFgMsex6dkZ3jP1kA03'
  },
  {
    id: 'full-kit', name: 'The Full Kit', price: 160, category: 'Sets',
    color: 'Black / White', image: 'hoodie', scene: 'hoodie-scene',
    alt: 'Blackout Hoodie, included in the SUL Full Kit',
    sceneAlt: 'Blackout Hoodie styled with a cap on a store mannequin; hoodie is part of the Full Kit',
    gallery: ['hoodie', 'hoodie-scene'], sizes: ['S', 'M', 'L', 'XL', '2XL'],
    description: 'One look, three pieces. The Blackout Hoodie, matching joggers, and essential SUL tee together in black. Your everyday rotation, sorted.',
    details: [['Includes', 'Blackout Hoodie + Joggers + Tee'], ['Material', 'Heavyweight cotton fleece'], ['Fit', 'Oversized / Relaxed'], ['Color', 'Black / White print']],
    imageNote: 'Blackout Hoodie shown. The kit also includes joggers and a tee.',
    checkout: 'https://buy.stripe.com/test_cNi7sN53K74E3KpcUp1kA04'
  }
];

// Women's first drop. Flip `status` to 'live' once the shipment is received and inspected.
// Prices, quantities, and colorways come from the owner's launch plan (2026-10-31). Sizes XS–XL are a
// working assumption until the manufacturer's size run is confirmed. No photography exists yet, so each
// set is shown as a colorway swatch; add `image`/`scene` keys here when photos are ready.
export const drop = {
  id: 'drop', name: 'Women’s collection', status: 'coming-soon', totalSets: 27,
  email: 'sulcollective@gmail.com', instagram: 'https://www.instagram.com/snoozeulose/'
};
const womensSizes = ['XS', 'S', 'M', 'L', 'XL'];
export const sets = [
  {
    id: 'olive-set', name: 'Olive 4-Piece', category: 'Women', price: 149.99, quantity: 7, pieces: 4,
    color: 'Olive', colorway: 'Olive', sizes: womensSizes, tile: { bg: '#4a5337', ink: '#eeeef0' },
    description: 'The full look in one order. Four matching pieces in olive with signature crown details, cut to be worn together or split across the week. Seven sets made for the first drop.',
    details: [['Set', 'Four matching pieces'], ['Colorway', 'Olive'], ['Run', '7 sets in the first drop'], ['Details', 'Signature crown details'], ['Sizes', 'XS to XL']]
  },
  {
    id: 'navy-cream-set', name: 'Navy / Cream 3-Piece', category: 'Women', price: 129.99, quantity: 7, pieces: 3,
    color: 'Navy / Cream', colorway: 'Navy / Cream', sizes: womensSizes, tile: { bg: '#1c2a4b', ink: '#eeeef0', band: '#e8e0d0' },
    description: 'Deep navy against cream. Three matching pieces with signature crown details, made to be worn as one look. Seven sets made for the first drop.',
    details: [['Set', 'Three matching pieces'], ['Colorway', 'Navy / Cream'], ['Run', '7 sets in the first drop'], ['Details', 'Signature crown details'], ['Sizes', 'XS to XL']]
  },
  {
    id: 'black-set', name: 'All Black 3-Piece', category: 'Women', price: 129.99, quantity: 8, pieces: 3,
    color: 'Black', colorway: 'All black', sizes: womensSizes, tile: { bg: '#15171a', ink: '#c1c5ce' },
    description: 'All black, head to toe. Three matching pieces with signature crown details and nothing else to distract from them. Eight sets made for the first drop.',
    details: [['Set', 'Three matching pieces'], ['Colorway', 'All black'], ['Run', '8 sets in the first drop'], ['Details', 'Signature crown details'], ['Sizes', 'XS to XL']]
  },
  {
    id: 'pink-set', name: 'Blush Pink 3-Piece', category: 'Women', price: 129.99, quantity: 5, pieces: 3,
    color: 'Blush pink', colorway: 'Blush pink', sizes: womensSizes, tile: { bg: '#e4b4bf', ink: '#111315' },
    description: 'The softest colorway in the drop and the smallest run. Three matching pieces in blush pink with signature crown details. Five sets made for the first drop.',
    details: [['Set', 'Three matching pieces'], ['Colorway', 'Blush pink'], ['Run', '5 sets in the first drop'], ['Details', 'Signature crown details'], ['Sizes', 'XS to XL']]
  }
];
export const catalog = [...sets, ...products];
export const dropLive = drop.status === 'live';

export const imagePath = (name) => `assets/images/${name}.webp`;
export const money = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, maximumFractionDigits: Number.isInteger(amount) ? 0 : 2 }).format(amount);
// Claims and orders for the drop go to SUL by email until a live checkout exists.
export const claimLink = (set, size) => {
  const subject = `${dropLive ? 'Order' : 'Claim'}: ${set.name}${size ? `, size ${size}` : ''}`;
  const body = `Hi SUL,\n\nI’d like to ${dropLive ? 'order' : 'claim'} the ${set.name} (${set.colorway}) in size ${size || '[your size]'} at ${money(set.price)}.\n\nName:\nCity:\nInstagram:\n`;
  return `mailto:${drop.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
