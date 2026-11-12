import { stripeLinks } from './stripe-links.js';

// Checkout for a style: a live link pasted into the catalog wins, then the live link the build made
// (assets/stripe-links.js, owner's request 2026-11-11), then whatever was pasted (test links stay hidden).
// `manualCheckout` keeps the pasted link so scripts/stripe-links.mjs can tell the two apart.
function withCheckout(p, pasted = '') {
  const made = stripeLinks[p.id];
  const checkout = /^https:\/\/buy\.stripe\.com\/(?!test_)/.test(pasted) ? pasted : made?.active ? made.url : pasted;
  return { ...p, manualCheckout: pasted, checkout };
}

// Shelved on the owner's instruction (2026-11-01): off the site for now, price under review.
// Move an entry back into `products` and rebuild to relist it.
export const shelved = [
  {
    id: 'bomber-jacket', name: 'Bomber Jacket', price: 125, category: 'Outerwear',
    color: 'Black / Embroidered', image: 'bomber', scene: 'bomber-scene',
    alt: 'Black SUL bomber jacket with outlined chest embroidery and shoulder patches',
    sceneAlt: 'SUL bomber jacket styled in a warmly lit storefront',
    gallery: ['bomber', 'bomber-scene'], sizes: ['S', 'M', 'L', 'XL', '2XL'],
    fit: 'Regular fit, true to size', fitNote: 'The bomber runs true to size with a regular fit through the body and sleeve.',
    description: 'The piece that pulls the whole look together. A black satin bomber with SUL chest embroidery, custom patches, and ribbed finishing. Zip it up. Step out.',
    details: [['Material', 'Satin shell / Polyester lining'], ['Fit', 'Regular / True to size'], ['Details', 'Full zip, embroidered patches, interior pocket'], ['Finishing', 'Ribbed collar and cuffs']],
    checkout: 'https://buy.stripe.com/test_14A9AVdAgcoY5Sx8E91kA01'
  }
];
export const products = [
  {
    id: 'blackout-hoodie', name: 'Blackout Hoodie', price: 85, category: 'Tops',
    color: 'Black / White', image: 'blackout-hoodie-model', photo: 'hoodie', scene: 'hoodie-scene',
    alt: 'Model wearing the Blackout Hoodie, black with white SUL lettering down both sleeves',
    photoAlt: 'Black SUL hoodie with white lettering on both sleeves',
    sceneAlt: 'Blackout Hoodie and SUL cap styled on a store mannequin',
    gallery: ['blackout-hoodie-model', 'hoodie', 'hoodie-scene'], sizes: ['S', 'M', 'L', 'XL', '2XL'],
    fit: 'Relaxed, oversized fit', fitNote: 'The hoodie is cut for a relaxed, oversized fit. Choose your usual size for the look as shown.',
    description: 'All black. All SUL. A heavyweight hoodie with bold white sleeve lettering, a relaxed silhouette, and a kangaroo pocket. An everyday piece with a presence of its own.',
    details: [['Material', 'Heavyweight cotton fleece'], ['Fit', 'Oversized / Relaxed'], ['Details', 'Kangaroo pocket, ribbed cuffs'], ['Color', 'Black / White sleeve print']],
    checkout: 'https://buy.stripe.com/test_fZu9AV1RyfBa6WB5rX1kA00'
  },
  {
    id: 'lion-sweater', name: 'Lion Sweater', price: 95, category: 'Tops',
    color: 'Black / White', image: 'lion-sweater-model', photo: 'sweater', scene: 'sweater-scene',
    alt: 'Model wearing the Lion Sweater, a black crewneck with outlined SUL lettering and an embroidered lion crest',
    photoAlt: 'Black crewneck sweater with outlined SUL lettering and embroidered lion crest',
    sceneAlt: 'SUL sweater displayed in a glass storefront',
    gallery: ['lion-sweater-model', 'sweater', 'sweater-scene'], sizes: ['S', 'M', 'L', 'XL', '2XL'],
    fit: 'Relaxed, oversized fit', fitNote: 'The sweater is cut for a relaxed, oversized fit. Choose your usual size for the look as shown.',
    description: 'The lion takes its place. A heavyweight knit crewneck with the signature embroidered crest above outlined SUL lettering. Relaxed, substantial, and ready to layer.',
    details: [['Material', 'Heavyweight knit cotton blend'], ['Fit', 'Relaxed / Oversized'], ['Details', 'Embroidered lion crest'], ['Finishing', 'Ribbed collar, cuffs, and hem']],
    checkout: 'https://buy.stripe.com/test_6oU5kFao42Oo2Gl1bH1kA02'
  },
  {
    id: 'new-era-hat', name: 'New Era Trucker Hat', price: 45, category: 'Accessories',
    color: 'Black / White', image: 'new-era-hat-model', photo: 'hat', scene: 'hat-side',
    alt: 'Model wearing the New Era Trucker Hat, a black cap with raised white SUL embroidery',
    photoAlt: 'Black SUL cap with raised white front embroidery',
    sceneAlt: 'Side view of the SUL New Era cap showing the side flag and mesh panels',
    gallery: ['new-era-hat-model', 'hat', 'hat-side'], sizes: ['One size'],
    fit: 'One size, adjustable', fitNote: 'One size. The snapback closure adjusts to fit.',
    description: 'Finish the look. A black mesh trucker cap with raised SUL embroidery, the New Era side flag, and an adjustable snapback closure.',
    details: [['Brand', 'SUL × New Era'], ['Style', 'Trucker / Mesh back'], ['Closure', 'Adjustable snapback'], ['Details', '3D embroidery, New Era side flag']],
    checkout: 'https://buy.stripe.com/test_bJe5kFgMsex6dkZ3jP1kA03'
  },
  {
    id: 'full-kit', name: 'The Full Kit', price: 160, category: 'Sets',
    color: 'Black / White', image: 'full-kit-model', photo: 'hoodie-scene', scene: 'hoodie',
    alt: 'Model wearing the Blackout Hoodie with white SUL sleeve lettering and matching black joggers',
    photoAlt: 'Blackout Hoodie styled with a cap on a store mannequin; hoodie is part of the Full Kit',
    sceneAlt: 'Blackout Hoodie, included in the SUL Full Kit',
    gallery: ['full-kit-model', 'hoodie-scene', 'hoodie'], sizes: ['S', 'M', 'L', 'XL', '2XL'],
    fit: 'Relaxed, oversized fit', fitNote: 'The hoodie, joggers, and tee are cut for a relaxed, oversized fit. Choose your usual size for the look as shown.',
    description: 'One look, three pieces. The Blackout Hoodie, matching joggers, and essential SUL tee together in black. Your everyday rotation, sorted.',
    details: [['Includes', 'Blackout Hoodie + Joggers + Tee'], ['Material', 'Heavyweight cotton fleece'], ['Fit', 'Oversized / Relaxed'], ['Color', 'Black / White print']],
    imageNote: 'Blackout Hoodie shown. The kit also includes joggers and a tee.',
    checkout: 'https://buy.stripe.com/test_cNi7sN53K74E3KpcUp1kA04'
  }
].map((p) => withCheckout(p, p.checkout));

// Women's first drop. Live since 2026-11-05 at the owner's instruction (was 'coming-soon').
// Prices and colorways come from the owner's launch plan (2026-10-31); pieces and the per-size run
// (`stock`) from the owner's inventory list (2026-10-31). `sizes` is derived from sizes with stock.
// `image` is a Higgsfield edit of the owner's campaign image (background and lighting only, labeled on the page);
// `campaignCrop` is the original crop of assets/images/womens-drop.webp; `tile` colors
// remain as the fallback swatch.
export const drop = {
  id: 'drop', name: 'Women’s collection', status: 'live', totalSets: 27,
  email: 'sulcollective@gmail.com', instagram: 'https://www.instagram.com/thesulcollective/'
};
// The build makes each set's live Stripe Payment Link by itself (assets/stripe-links.js). Paste a link here
// only to use one made by hand instead; it then wins. A set with no live link is ordered by email.
export const setCheckout = {
  'olive-set': '',
  'navy-cream-set': '',
  'black-set': '',
  'pink-set': ''
};
const sizesWithStock = (stock) => Object.keys(stock).filter((size) => stock[size] > 0);
export const sets = [
  {
    id: 'olive-set', name: 'Olive 4-Piece', category: 'Women', sizeChart: 'olive', price: 149.99, quantity: 7, pieces: 4,
    color: 'Olive', colorway: 'Olive', stock: { XS: 1, S: 1, M: 2, L: 2, XL: 1 }, tile: { bg: '#4a5337', ink: '#eeeef0' },
    image: 'olive-set-studio', campaignCrop: 'olive-set', scene: 'womens-lineup', gallery: ['olive-set-studio', 'womens-lineup'],
    // AI concept images made from the owner's mannequin sample photos (Higgsfield, 2026-11-02). Always labeled on the page.
    renders: [
      { image: 'olive-render-front', alt: 'AI concept image of a model wearing the Olive 4-Piece: striped olive and cream knit cardigan tied at the waist, olive top and leggings with crown details, and cream leg warmers' },
      { image: 'olive-render-pose', alt: 'AI concept image of a model with one hand on the hip wearing the Olive 4-Piece, three-quarter view' },
      { image: 'olive-render-detail', alt: 'AI concept detail of the Olive 4-Piece from the waist down, showing the crown on the leggings and the crown on the cream leg warmers' }
    ],
    alt: 'Model wearing the S.U.L Olive 4-Piece: olive tank and leggings with crown details under a striped knit cardigan',
    sceneAlt: 'AI-edited image of all four complete S.U.L women’s sets side by side on a royal blue background',
    fit: 'Close, stretchy fit', fitNote: 'The olive fitted set is designed for a close, stretchy fit.',
    description: 'The full look in one order. An olive fitted tank and fitted leggings with crown details, a cream and olive cardigan over the top, and cream leg warmers. Seven sets made for the first drop.',
    details: [['Set', 'Fitted tank, fitted leggings, cream/olive cardigan, cream leg warmers'], ['Colorway', 'Olive'], ['Details', 'Crown details on tank and leggings']]
  },
  {
    id: 'navy-cream-set', name: 'Navy / Cream 3-Piece', category: 'Women', sizeChart: 'skirt', price: 129.99, quantity: 7, pieces: 3,
    color: 'Navy / Cream', colorway: 'Navy / Cream', stock: { XS: 1, S: 1, M: 2, L: 2, XL: 1 }, tile: { bg: '#1c2a4b', ink: '#eeeef0', band: '#e8e0d0' },
    image: 'navy-cream-set-studio', campaignCrop: 'navy-cream-set', scene: 'womens-lineup', gallery: ['navy-cream-set-studio', 'womens-lineup'],
    alt: 'Model wearing the S.U.L Navy / Cream 3-Piece: navy crown crewneck with a cream pleated skirt',
    sceneAlt: 'AI-edited image of all four complete S.U.L women’s sets side by side on a royal blue background',
    fit: 'Relaxed top, sized by waist and hip', fitNote: 'The sweatshirt is designed for a relaxed, oversized fit. For the skirt outfits, choose your size primarily based on your waist and hip measurements.',
    description: 'Deep navy against cream. A navy sweatshirt with the S.U.L crown across the chest, a cream pleated skirt with built-in shorts and a crown at the hem, and cream leg warmers. Seven sets made for the first drop.',
    details: [['Set', 'Navy sweatshirt, cream pleated skirt with built-in shorts, cream leg warmers'], ['Colorway', 'Navy / Cream'], ['Details', 'Crown crest on chest and skirt']]
  },
  {
    id: 'black-set', name: 'All Black 3-Piece', category: 'Women', sizeChart: 'skirt', price: 129.99, quantity: 8, pieces: 3,
    color: 'Black', colorway: 'All black', stock: { XS: 1, S: 1, M: 1, L: 3, XL: 1, '2XL': 1 }, tile: { bg: '#15171a', ink: '#c1c5ce' },
    image: 'black-set-studio', campaignCrop: 'black-set', scene: 'womens-lineup', gallery: ['black-set-studio', 'womens-lineup'],
    alt: 'Model wearing the S.U.L All Black 3-Piece: black crown crewneck with a black pleated skirt',
    sceneAlt: 'AI-edited image of all four complete S.U.L women’s sets side by side on a royal blue background',
    fit: 'Relaxed top, sized by waist and hip', fitNote: 'The sweatshirt is designed for a relaxed, oversized fit. For the skirt outfits, choose your size primarily based on your waist and hip measurements.',
    description: 'All black, head to toe. A black sweatshirt with the S.U.L crown across the chest, a black pleated skirt with built-in shorts and a crown at the hem, and black leg warmers. Eight sets made for the first drop, the only colorway with a 2XL.',
    details: [['Set', 'Black sweatshirt, black pleated skirt with built-in shorts, black leg warmers'], ['Colorway', 'All black'], ['Details', 'Crown crest on chest and skirt']]
  },
  {
    id: 'pink-set', name: 'Blush Pink 3-Piece', category: 'Women', sizeChart: 'skirt', price: 129.99, quantity: 5, pieces: 3,
    color: 'Blush pink', colorway: 'Blush pink', stock: { XS: 1, S: 1, M: 1, L: 1, XL: 1 }, tile: { bg: '#e4b4bf', ink: '#111315' },
    image: 'pink-set-studio', campaignCrop: 'pink-set', scene: 'womens-lineup', gallery: ['pink-set-studio', 'womens-lineup'],
    alt: 'Model wearing the S.U.L Blush Pink 3-Piece: pink crown crewneck with a pink pleated skirt',
    sceneAlt: 'AI-edited image of all four complete S.U.L women’s sets side by side on a royal blue background',
    fit: 'Relaxed top, sized by waist and hip', fitNote: 'The sweatshirt is designed for a relaxed, oversized fit. For the skirt outfits, choose your size primarily based on your waist and hip measurements.',
    description: 'The softest colorway in the drop and the smallest run. A blush pink sweatshirt with the S.U.L crown across the chest, a pink pleated skirt with built-in shorts, and cream and pink leg warmers. Five sets made for the first drop, one per size.',
    details: [['Set', 'Blush pink sweatshirt, pink pleated skirt with built-in shorts, cream/pink leg warmers'], ['Colorway', 'Blush pink'], ['Details', 'Crown crest on chest and skirt']]
  }
].map((set) => withCheckout({ ...set, sizes: sizesWithStock(set.stock) }, setCheckout[set.id]));
export const catalog = [...sets, ...products];

// Homepage headliner (owner's request, 2026-11-09). Real photos the owner supplied the same day.
// No price or sizes confirmed yet, so the action is an email inquiry. Add a `price` to show it.
export const headliner = {
  id: 'crown-set', name: 'The Charcoal Crown Set', pieces: 'Hoodie + joggers', color: 'Charcoal wash / Chrome blue',
  price: null,
  description: 'Washed charcoal fleece, the SUL crown on the chest and the leg, and the full chrome crest across the back. Snooze U Lose, est. 2020.',
  // AI images made in the owner's Higgsfield account (nano_banana_flash, 2026-11-10) from the real photos below.
  // The owner asked for them on the section on 2026-11-11. The first leads; all are labeled on the page.
  // Full-size sources: site-photos/crown-generated/.
  photos: [
    { image: 'crown-set-night-front', size: [1400, 1738], label: 'Night street, front', alt: 'AI-edited photo of the same man in the SUL Charcoal Crown Set, now on a wet city street at night with royal blue neon light behind him' },
    { image: 'crown-set-crest', size: [1000, 1242], label: 'Crest close-up', alt: 'AI close-up of the chrome and royal blue SUL crown crest on the back of the charcoal hoodie, above the words Snooze U Lose, est. 2020' },
    { image: 'crown-set-night-back', size: [1000, 1242], label: 'Night street, back', alt: 'AI image of the Charcoal Crown Set from behind, hood up, on a rainy street at night, showing the crown crest across the back' },
    { image: 'crown-set-flatlay', size: [1000, 1242], label: 'Flat lay', alt: 'AI flat lay of the charcoal hoodie, back side up with the crown crest, beside the matching joggers on dark concrete' }
  ],
  // The owner's real photos (2026-11-09), unedited. They show the true color and print.
  real: [
    { image: 'crown-set-front', label: 'Real photo, front', alt: 'Man wearing the SUL Charcoal Crown Set, a washed charcoal hoodie and joggers with a small crown logo on the chest and leg, on a fall street' },
    { image: 'crown-set-print', label: 'Real photo, crest', alt: 'Close-up of the back of the charcoal hoodie: a large chrome and royal blue SUL crown crest above the words Snooze U Lose, est. 2020' },
    { image: 'crown-set-back', label: 'Real photo, back', alt: 'Back view of the Charcoal Crown Set, hood up, showing the chrome crown print and the joggers' },
    { image: 'crown-set-hood', label: 'Real photo, hood up', alt: 'Man pulling up the hood of the charcoal SUL hoodie, joggers and blue sneakers, autumn trees behind' }
  ]
};
export const headlinerLink = () => `mailto:${drop.email}?subject=${encodeURIComponent(`Crown Set: size [your size]`)}&body=${encodeURIComponent(`Hi SUL,\n\nI want the Charcoal Crown Set (hoodie + joggers).\n\nSize:\nName:\nCity:\nInstagram:\n`)}`;
// Sets are limited runs, so a bag can never hold more of a size than were made.
export const maxQuantity = (p, size) => (p.stock ? p.stock[size] || 0 : 99);
export const dropLive = drop.status === 'live';

// Size guide. Fit notes and the two women's charts come from the owner (2026-11-01); waist, hips, and
// bust are body measurements in inches, skirt length is the garment's. The unisex chart for the
// older pieces is standard US sizing until those garments are measured. Each chart shows only the
// sizes a style is made in.
export const sizeCharts = {
  olive: { columns: ['Size', 'Bust', 'Waist', 'Hips'], note: 'Body measurements in inches.', rows: {
    XS: ['30–32', '24–26', '34–36'], S: ['32–34', '26–28', '36–38'], M: ['34–36', '28–30', '38–40'],
    L: ['36–39', '30–33', '40–43'], XL: ['39–42', '33–36', '43–46'], '2XL': ['42–46', '36–40', '46–50']
  } },
  skirt: { columns: ['Size', 'Waist', 'Hips', 'Skirt length'], note: 'Waist and hips are body measurements in inches. Skirt length is the skirt itself.', rows: {
    XS: ['24–26', '34–36', '14'], S: ['26–28', '36–38', '14¼'], M: ['28–30', '38–40', '14½'],
    L: ['30–33', '40–43', '15'], XL: ['33–36', '43–46', '15½'], '2XL': ['36–40', '46–50', '16']
  } },
  unisex: { columns: ['Size', 'Chest', 'Waist'], note: 'Body measurements in inches, standard US sizing.', rows: {
    S: ['35–37', '29–31'], M: ['38–40', '32–34'], L: ['41–43', '35–37'], XL: ['44–46', '38–40'], '2XL': ['47–49', '41–43']
  } }
};
export const measuringNotes = [
  ['Bust / chest', 'Around the fullest part, tape level across the back.'],
  ['Waist', 'Around the natural waistline, where the body bends.'],
  ['Hips', 'Around the fullest part, about 8 in below the waist.']
];
export const sizeGuideFor = (p) => {
  const chart = p.sizes.length <= 1 ? null : sizeCharts[p.sizeChart || 'unisex'];
  return { fit: p.fit, note: p.fitNote, chart: chart && { columns: chart.columns, note: chart.note, rows: p.sizes.filter((size) => chart.rows[size]).map((size) => [size, ...chart.rows[size]]) } };
};

export const imagePath = (name) => `assets/images/${name}.webp`;
export const money = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, maximumFractionDigits: Number.isInteger(amount) ? 0 : 2 }).format(amount);
// Only live Stripe Payment Links take payment; test-mode links (buy.stripe.com/test_...) are never shown
// to customers. Anything without a live link is ordered by email to SUL.
export const isLiveCheckout = (url) => /^https:\/\/buy\.stripe\.com\/(?!test_)[A-Za-z0-9_]+$/.test(url || '');
// The bag's sizes and quantities ride along as client_reference_id (letters, digits, - and _ only),
// shown on the payment in the Stripe dashboard, e.g. "olive-set_M-1_L-2".
export const stripeLink = (p, items) => {
  const ref = `${p.id}_${items.map((item) => `${item.size}-${item.quantity}`).join('_')}`.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 200);
  return `${p.checkout}?client_reference_id=${encodeURIComponent(ref)}`;
};
export const claimLink = (set, size) => {
  const subject = `${dropLive ? 'Order' : 'Claim'}: ${set.name}${size ? `, size ${size}` : ''}`;
  const body = `Hi SUL,\n\nI’d like to ${dropLive ? 'order' : 'claim'} the ${set.name} (${set.colorway || set.color}) in size ${size || '[your size]'} at ${money(set.price)}.\n\nName:\nCity:\nInstagram:\n`;
  return `mailto:${drop.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
// One email for every bag item that has no live payment link.
export const orderEmailLink = (lines) => {
  const total = lines.reduce((sum, { p, item }) => sum + p.price * item.quantity, 0);
  const list = lines.map(({ p, item }) => `- ${p.name} (${p.colorway || p.color}), size ${item.size} × ${item.quantity} — ${money(p.price * item.quantity)}`).join('\n');
  const body = `Hi SUL,\n\nI’d like to order:\n${list}\n\nSubtotal: ${money(total)}\n\nName:\nShipping address:\nPhone:\nInstagram:\n`;
  return `mailto:${drop.email}?subject=${encodeURIComponent(`Order: ${lines.map(({ p, item }) => `${p.name} ${item.size}`).join(', ')}`)}&body=${encodeURIComponent(body)}`;
};
