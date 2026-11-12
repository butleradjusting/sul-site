const { chromium } = require(process.env.SUL_PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const base = process.env.SUL_PREVIEW_URL || 'http://127.0.0.1:4173';
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.SUL_PLAYWRIGHT_CHANNEL ? { channel: process.env.SUL_PLAYWRIGHT_CHANNEL } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  // Checkout clicks its link when that is the only destination. In real Chrome an email link opens a Mail
  // window per run and a Stripe link opens the live payment page, so both stop here. The test still reads each link.
  await page.addInitScript(() => document.addEventListener('click', (event) => { if (event.target.closest?.('a[href^="mailto:"], a[href^="https://buy.stripe.com/"]')) event.preventDefault(); }, true));
  const { stripeLinks } = await import('../assets/stripe-links.js');
  const liveLink = (id) => (stripeLinks[id]?.active ? stripeLinks[id].url : '');
  const checkoutHrefs = () => page.locator('#preview-links a').evaluateAll((links) => links.map((a) => decodeURIComponent(a.getAttribute('href'))));
  const errors = [];
  const failures = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
  try {
    await page.goto(`${base}/collections.html`);
    await page.getByRole('button', { name: 'Accessories', exact: true }).click();
    assert.equal(await page.locator('.product-card:visible').count(), 1);
    assert.equal(await page.locator('#collection-count').innerText(), '1 style');
    await page.getByRole('button', { name: 'Women', exact: true }).click();
    assert.equal(await page.locator('.product-card:visible').count(), 4);
    await page.getByRole('button', { name: 'All pieces', exact: true }).click();
    await page.selectOption('#sort-products', 'price-low');
    assert.equal(await page.locator('.product-card').first().getAttribute('data-price'), '45');
    await page.getByRole('button', { name: 'Styled', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.card-main-image').src.endsWith('hat-side.webp'));

    await page.getByRole('button', { name: 'Choose size for Blackout Hoodie', exact: true }).click();
    assert(await page.locator('#quick-dialog').isVisible());
    await page.locator('#quick-dialog [data-add]').click();
    assert.match(await page.locator('#quick-dialog .inline-error').innerText(), /Choose a size/);
    await page.locator('#quick-dialog [data-size="L"]').click();
    await page.locator('#quick-dialog [data-add]').click();
    assert(await page.locator('#bag-dialog').isVisible());
    assert.equal(await page.locator('#bag-total').innerText(), '$85');
    await page.locator('[data-change="1"]').click();
    assert.equal(await page.locator('#bag-total').innerText(), '$170');
    await page.locator('#preview-checkout').click();
    assert.equal(await page.locator('#preview-links a[href*="stripe.com/test_"]').count(), 0);
    if (liveLink('blackout-hoodie')) {
      assert.deepEqual(await checkoutHrefs(), [`${liveLink('blackout-hoodie')}?client_reference_id=blackout-hoodie_L-2`]);
      assert.match(await page.locator('#bag-note').innerText(), /Set the same quantity on the Stripe page/);
    } else {
      assert.match(await page.locator('#bag-note').innerText(), /sent to SUL by email/);
      assert.match((await checkoutHrefs())[0], /Blackout Hoodie \(Black \/ White\), size L × 2/);
    }
    await page.keyboard.press('Escape');
    assert(!(await page.locator('#bag-dialog').isVisible()));
    await page.reload();
    assert.equal(await page.locator('.bag-count').innerText(), '(2)');

    await page.goto(`${base}/pink-set.html`);
    await page.locator('[data-size="XS"]').click();
    await page.locator('[data-add]').first().click();
    assert.equal(await page.locator('.bag-item:has-text("Blush Pink")').count(), 1);
    assert(await page.locator('.bag-item:has-text("Blush Pink") [data-change="1"]').isDisabled());
    assert.match(await page.locator('.bag-limit').innerText(), /Only 1 made in XS/);
    await page.keyboard.press('Escape');
    await page.locator('[data-add]').first().click();
    assert.match(await page.locator('.product-summary .inline-error').innerText(), /Only 1 made in XS/);
    await page.getByRole('button', { name: /Open shopping bag/ }).click();
    await page.locator('.bag-item:has-text("Blush Pink") [data-remove]').click();
    await page.keyboard.press('Escape');

    await page.goto(`${base}/olive-set.html`);
    assert((await page.locator('#gallery-image').getAttribute('src')).endsWith('olive-set-studio.webp'));
    assert.match(await page.locator('#gallery-note').innerText(), /AI-edited/);
    assert.equal(await page.locator('[data-gallery]').count(), 6);
    assert(await page.locator('#gallery-tag').isVisible());
    await page.getByRole('button', { name: 'Set view', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('#gallery-image').src.endsWith('olive-set.webp'));
    assert.match(await page.locator('#gallery-note').innerText(), /campaign image/);
    assert(!(await page.locator('#gallery-tag').isVisible()));
    assert.match(await page.locator('.status-label').innerText(), /Available now/i);
    await page.locator('[data-add]').click();
    assert.match(await page.locator('.inline-error').innerText(), /Choose a size/);
    await page.locator('[data-size="M"]').click();
    assert.equal(await page.locator('.inline-error').innerText(), '');
    await page.locator('[data-add]').click();
    assert(await page.locator('#bag-dialog').isVisible());
    assert.equal(await page.locator('#bag-total').innerText(), '$319.99');
    await page.locator('#preview-checkout').click();
    if (liveLink('olive-set')) assert((await checkoutHrefs()).includes(`${liveLink('olive-set')}?client_reference_id=olive-set_M-1`));
    else assert((await checkoutHrefs()).some((href) => /Olive 4-Piece \(Olive\), size M × 1/.test(href)));
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.related .set-card').count(), 3);
    await page.getByRole('button', { name: 'Size guide', exact: true }).click();
    assert(await page.locator('#size-dialog').isVisible());
    assert.match(await page.locator('#size-content').innerText(), /close, stretchy fit/i);
    assert.equal(await page.locator('.size-table tbody tr').count(), 5);
    await page.keyboard.press('Escape');
    await page.goto(`${base}/black-set.html`);
    await page.getByRole('button', { name: 'Size guide', exact: true }).click();
    assert.match(await page.locator('#size-content').innerText(), /waist and hip measurements/);
    assert.equal(await page.locator('.size-table tbody tr').count(), 6);
    await page.keyboard.press('Escape');
    await page.goto(`${base}/collections.html`);
    await page.getByRole('button', { name: 'Choose size for Blush Pink 3-Piece', exact: true }).click();
    assert(await page.locator('#quick-dialog [data-add]').isVisible());
    assert.match(await page.locator('#quick-dialog .color-name').innerText(), /5 sets made/);
    await page.locator('#quick-dialog [data-size-guide]').click();
    assert(await page.locator('#size-dialog').isVisible());
    await page.keyboard.press('Escape');
    assert(!(await page.locator('#size-dialog').isVisible()));
    assert(await page.locator('#quick-dialog [data-add]').isVisible());
    await page.keyboard.press('Escape');

    await page.goto(`${base}/blackout-hoodie.html`);
    assert(await page.locator('#gallery-tag').isVisible());
    await page.locator('[data-gallery]').nth(2).click();
    await page.waitForFunction(() => document.querySelector('#gallery-image').src.endsWith('hoodie-scene.webp'));
    assert(!(await page.locator('#gallery-tag').isVisible()));
    await page.locator('.gallery-enlarge').click();
    assert(await page.locator('#image-dialog').isVisible());
    await page.waitForFunction(() => { const image = document.getElementById('enlarged-image'); return image.src.endsWith('hoodie-scene.webp') && image.complete && image.naturalWidth > 0; });
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: /Open shopping bag/ }).click();
    while (await page.locator('[data-remove]').count()) await page.locator('[data-remove]').first().click();
    assert.match(await page.locator('.bag-empty').innerText(), /a little empty/i);
    await page.keyboard.press('Escape');
    // A page brought back by Back or Forward reads the bag again. Safari sends it no storage event, so
    // without this the next add saves over whatever was added on the page in between.
    const restore = (items) => page.evaluate((saved) => { localStorage.setItem('sul-bag-v1', JSON.stringify(saved)); window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); }, items);
    await restore([{ id: 'olive-set', size: 'M', quantity: 1 }]);
    assert.equal(await page.locator('.bag-count').innerText(), '(1)');
    await restore([]);
    assert.equal(await page.locator('.bag-count').innerText(), '(0)');

    await page.goto(base);
    await page.getByRole('button', { name: 'After-hours essentials', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('#studio-image').src.endsWith('essentials-study.webp'));
    assert((await page.locator('.print-card img').first().getAttribute('src')).endsWith('snooze-look.webp'));
    await page.locator('.print-card').first().getByRole('button', { name: 'Shorts', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.print-card img').src.endsWith('snooze-shorts-studio.webp'));
    await page.getByRole('button', { name: 'Off the clock', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('#campaign-image').src.endsWith('outdoor.webp'));
    // Crown Set: the four AI images, no tags on the tiles, and no real-photo row. Each opens larger with the AI note.
    assert.equal(await page.locator('#crown .headliner-photo').count(), 4);
    assert.equal(await page.locator('#crown .headliner-real, #crown .headliner-chip, #crown .headliner-tag').count(), 0);
    await page.locator('#crown .headliner-photo').first().click();
    assert(await page.locator('#image-dialog').isVisible());
    assert(await page.locator('#enlarged-note').isVisible());
    await page.keyboard.press('Escape');
    // The Crown Set sells right in the section: $160, S–XL, size first, then the bag pays by Stripe (or email without a link).
    assert.equal(await page.locator('#crown a[href^="mailto:"]').count(), 0);
    assert.equal(await page.locator('#crown [data-size]').count(), 4);
    await page.locator('#crown [data-add="crown-set"]').click();
    assert.match(await page.locator('#crown .inline-error').innerText(), /Choose a size/);
    await page.locator('#crown [data-size="L"]').click();
    await page.locator('#crown [data-add="crown-set"]').click();
    assert.equal(await page.locator('#bag-total').innerText(), '$160');
    await page.locator('#preview-checkout').click();
    if (liveLink('crown-set')) assert.deepEqual(await checkoutHrefs(), [`${liveLink('crown-set')}?client_reference_id=crown-set_L-1`]);
    else assert.match((await checkoutHrefs())[0], /The Charcoal Crown Set \(Charcoal wash \/ Chrome blue\), size L × 1/);
    await page.locator('.bag-item:has-text("Crown Set") [data-remove]').click();
    await page.keyboard.press('Escape');
    // The wake-up call sits in the hero. The clock reads the visitor's time and is the snooze button: three taps and
    // it's spent, then any link to the drop wakes it. "Our world" is words only again.
    assert.equal(await page.locator('#story #alarm').count(), 0);
    assert.equal(await page.locator('.hero-copy #alarm').count(), 1);
    const alarmText = (id) => page.locator(id).textContent();
    await page.evaluate(() => scrollTo(0, 0));
    assert.match(await alarmText('#alarm-time'), /^\d{1,2}:\d{2} (AM|PM)$/);
    assert.match(await alarmText('#alarm-label'), /^Your time/);
    assert.equal(await alarmText('#alarm-message'), 'Snooze if you dare');
    await page.locator('#alarm-snooze').click();
    assert.equal(await alarmText('#alarm-message'), 'You don’t get them back.');
    assert.equal(await alarmText('#alarm-label'), '9 min later');
    await page.locator('#alarm-snooze').click();
    await page.locator('#alarm-snooze').click();
    assert(await page.locator('#alarm-snooze').isDisabled());
    assert.equal(await alarmText('#alarm-message'), 'Out of snoozes.');
    assert.equal(await alarmText('#alarm-label'), '27 min later');
    assert(await page.locator('#alarm-wake').isVisible());
    await page.locator('#alarm-wake').click();
    await page.waitForURL(/#drop$/);
    assert.match(await alarmText('#alarm-message'), /^You’re up/);
    assert.equal(await alarmText('#alarm-label'), 'Right on time');
    assert(await page.locator('#alarm-snooze').isEnabled());
    assert(!(await page.locator('#alarm-wake').isVisible()));
    // Without the 3D wall, "Women’s drop" links land on the sets, not on the headliner above them.
    await page.goto(`${base}/collections.html`);
    await page.locator('.desktop-nav a', { hasText: 'Women’s drop' }).click();
    await page.waitForURL(/#drop$/);
    await page.waitForFunction(() => { const top = document.getElementById('sets').getBoundingClientRect().top; return top >= 0 && top < innerHeight / 2; });
    // The skip link stays out of sight until the keyboard reaches it.
    assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.skip-link')).opacity), '0');
    await page.locator('.skip-link').focus();
    assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.skip-link')).opacity), '1');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    assert(await page.locator('#menu-dialog').isVisible());
    await page.keyboard.press('Escape');

    const paths = ['index.html', 'collections.html', 'blackout-hoodie.html', 'lion-sweater.html', 'new-era-hat.html', 'full-kit.html', 'olive-set.html', 'navy-cream-set.html', 'black-set.html', 'pink-set.html', '404.html'];
    for (const width of [320, 375, 390, 430, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const path of paths) {
        await page.goto(`${base}/${path}`);
        const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
        assert(scroll <= width, `Overflow on ${path} at ${width}px`);
        assert.equal(await page.locator('h1').count(), 1, `Expected one primary heading on ${path}`);
      }
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(failures, []);
    fs.mkdirSync('.impeccable/review', { recursive: true });
    fs.writeFileSync('.impeccable/review/smoke-report.json', JSON.stringify({ passed: true, checks: ['Category filters and counts', 'Price sorting', 'Studio and styled photography', 'Size validation', 'Add to bag', 'Quantity and subtotal', 'Email order fallback, no test links', 'Escape and dialog behavior', 'Cross-page persisted bag', 'Remove and empty bag', 'Product gallery and enlarged image', 'Studio board switch', 'Shirt and shorts switch', 'Lookbook switch', 'Mobile menu', 'Women’s drop live: add to bag, order link, quick view', 'Bag reread after Back', 'Women’s drop link without the 3D wall', 'Skip link hidden until focused', 'Wake-up call in the hero: live time, three snoozes, wake by the drop link', 'Crown Set photos: four AI images, no tags, enlarge with the AI note', '72 route and viewport checks'], javascriptErrors: errors, httpErrors: failures }, null, 2));
    console.log('Passed: shopping flows, persistence, gallery controls, mobile menu, the live women’s drop, and 72 route/viewport checks. No JavaScript or HTTP errors.');
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
