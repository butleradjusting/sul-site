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
// Prices and colorways come from the owner's launch plan (2026-10-31); pieces and the per-size run
// (`stock`) from the owner's inventory list (2026-10-31). `sizes` is derived from sizes with stock.
// Photos are crops of the owner's campaign image (assets/images/womens-drop.webp); `tile` colors
// remain as the fallback swatch.
export const drop = {
  id: 'drop', name: 'Women’s collection', status: 'coming-soon', totalSets: 27,
  email: 'sulcollective@gmail.com', instagram: 'https://www.instagram.com/snoozeulose/'
};
const sizesWithStock = (stock) => Object.keys(stock).filter((size) => stock[size] > 0);
export const sets = [
  {
    id: 'olive-set', name: 'Olive 4-Piece', category: 'Women', price: 149.99, quantity: 7, pieces: 4,
    color: 'Olive', colorway: 'Olive', stock: { XS: 1, S: 1, M: 2, L: 2, XL: 1 }, tile: { bg: '#4a5337', ink: '#eeeef0' },
    image: 'olive-set', scene: 'womens-drop', gallery: ['olive-set', 'womens-drop'],
    alt: 'Model wearing the S.U.L Olive 4-Piece: olive tank and leggings with crown details under a striped knit cardigan',
    sceneAlt: 'The S.U.L women’s collection campaign image showing all four complete sets side by side',
    description: 'The full look in one order. An olive fitted tank and fitted leggings with crown details, a cream and olive cardigan over the top, and cream leg warmers. Seven sets made for the first drop.',
    details: [['Set', 'Fitted tank, fitted leggings, cream/olive cardigan, cream leg warmers'], ['Colorway', 'Olive'], ['Run', '7 sets in the first drop'], ['Details', 'Crown details on tank and leggings']]
  },
  {
    id: 'navy-cream-set', name: 'Navy / Cream 3-Piece', category: 'Women', price: 129.99, quantity: 7, pieces: 3,
    color: 'Navy / Cream', colorway: 'Navy / Cream', stock: { XS: 1, S: 1, M: 2, L: 2, XL: 1 }, tile: { bg: '#1c2a4b', ink: '#eeeef0', band: '#e8e0d0' },
    image: 'navy-cream-set', scene: 'womens-drop', gallery: ['navy-cream-set', 'womens-drop'],
    alt: 'Model wearing the S.U.L Navy / Cream 3-Piece: navy crown crewneck with a cream pleated skirt',
    sceneAlt: 'The S.U.L women’s collection campaign image showing all four complete sets side by side',
    description: 'Deep navy against cream. A navy sweatshirt with the S.U.L crown across the chest, a cream pleated skirt with built-in shorts and a crown at the hem, and cream leg warmers. Seven sets made for the first drop.',
    details: [['Set', 'Navy sweatshirt, cream pleated skirt with built-in shorts, cream leg warmers'], ['Colorway', 'Navy / Cream'], ['Run', '7 sets in the first drop'], ['Details', 'Crown crest on chest and skirt']]
  },
  {
    id: 'black-set', name: 'All Black 3-Piece', category: 'Women', price: 129.99, quantity: 8, pieces: 3,
    color: 'Black', colorway: 'All black', stock: { XS: 1, S: 1, M: 1, L: 3, XL: 1, '2XL': 1 }, tile: { bg: '#15171a', ink: '#c1c5ce' },
    image: 'black-set', scene: 'womens-drop', gallery: ['black-set', 'womens-drop'],
    alt: 'Model wearing the S.U.L All Black 3-Piece: black crown crewneck with a black pleated skirt',
    sceneAlt: 'The S.U.L women’s collection campaign image showing all four complete sets side by side',
    description: 'All black, head to toe. A black sweatshirt with the S.U.L crown across the chest, a black pleated skirt with built-in shorts and a crown at the hem, and black leg warmers. Eight sets made for the first drop, the only colorway with a 2XL.',
    details: [['Set', 'Black sweatshirt, black pleated skirt with built-in shorts, black leg warmers'], ['Colorway', 'All black'], ['Run', '8 sets in the first drop'], ['Details', 'Crown crest on chest and skirt']]
  },
  {
    id: 'pink-set', name: 'Blush Pink 3-Piece', category: 'Women', price: 129.99, quantity: 5, pieces: 3,
    color: 'Blush pink', colorway: 'Blush pink', stock: { XS: 1, S: 1, M: 1, L: 1, XL: 1 }, tile: { bg: '#e4b4bf', ink: '#111315' },
    image: 'pink-set', scene: 'womens-drop', gallery: ['pink-set', 'womens-drop'],
    alt: 'Model wearing the S.U.L Blush Pink 3-Piece: pink crown crewneck with a pink pleated skirt',
    sceneAlt: 'The S.U.L women’s collection campaign image showing all four complete sets side by side',
    description: 'The softest colorway in the drop and the smallest run. A blush pink sweatshirt with the S.U.L crown across the chest, a pink pleated skirt with built-in shorts, and cream and pink leg warmers. Five sets made for the first drop, one per size.',
    details: [['Set', 'Blush pink sweatshirt, pink pleated skirt with built-in shorts, cream/pink leg warmers'], ['Colorway', 'Blush pink'], ['Run', '5 sets in the first drop'], ['Details', 'Crown crest on chest and skirt']]
  }
].map((set) => ({ ...set, sizes: sizesWithStock(set.stock), details: [...set.details, ['Sizes made', Object.entries(set.stock).filter(([, n]) => n > 0).map(([size, n]) => `${size} ${n}`).join(' · ')]] }));
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
