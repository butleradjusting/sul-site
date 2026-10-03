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

export const imagePath = (name) => `assets/images/${name}.webp`;
export const money = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
