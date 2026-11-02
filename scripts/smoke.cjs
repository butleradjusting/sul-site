const { chromium } = require(process.env.SUL_PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const base = process.env.SUL_PREVIEW_URL || 'http://127.0.0.1:4173';
(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.SUL_PLAYWRIGHT_CHANNEL || undefined });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const errors = [];
  const failures = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
  try {
    await page.goto(`${base}/collections.html`);
    await page.getByRole('button', { name: 'Accessories', exact: true }).click();
    assert.equal(await page.locator('.product-card:visible').count(), 1);
    assert.equal(await page.locator('#collection-count').innerText(), '1 piece');
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
    assert.match(await page.locator('#bag-note').innerText(), /not passed to Stripe/);
    assert.match(await page.locator('#preview-links a').getAttribute('href'), /buy\.stripe\.com\/test_/);
    await page.keyboard.press('Escape');
    assert(!(await page.locator('#bag-dialog').isVisible()));
    await page.reload();
    assert.equal(await page.locator('.bag-count').innerText(), '(2)');

    await page.goto(`${base}/blackout-hoodie.html`);
    await page.locator('[data-gallery]').nth(1).click();
    await page.waitForFunction(() => document.querySelector('#gallery-image').src.endsWith('hoodie-scene.webp'));
    await page.locator('.gallery-enlarge').click();
    assert(await page.locator('#image-dialog').isVisible());
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: /Open shopping bag/ }).click();
    await page.locator('[data-remove]').click();
    assert.match(await page.locator('.bag-empty').innerText(), /a little empty/i);
    await page.keyboard.press('Escape');

    await page.goto(base);
    await page.getByRole('button', { name: 'After-hours essentials', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('#studio-image').src.endsWith('essentials-study.webp'));
    await page.locator('.print-card').first().getByRole('button', { name: 'Shorts', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.print-card img').src.endsWith('snooze-shorts.webp'));
    await page.getByRole('button', { name: 'Off the clock', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('#campaign-image').src.endsWith('outdoor.webp'));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    assert(await page.locator('#menu-dialog').isVisible());
    await page.keyboard.press('Escape');

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${base}/index.html`);
    assert.equal(await page.locator('.desktop-nav a[href="womens.html"]').count(), 1, 'Women’s link in the main menu');
    await page.locator('.womens-cta').click();
    await page.waitForURL(/womens\.html$/);
    assert.equal(await page.locator('.colorway-grid .colorway-card').count(), 4);
    assert.equal(await page.locator('.looks-list li').count(), 4);
    assert.equal(await page.locator('.size-table tbody tr').count(), 5);
    await page.goto(`${base}/womens-olive-luxe.html`);
    const comingSoon = (await page.locator('.coming-soon-action').count()) === 1;
    await page.locator('.look-option[data-look="knit-set"]').click();
    await page.waitForFunction(() => document.querySelector('#gallery-image').src.endsWith('olive-luxe-knit-set.svg'));
    assert.equal(await page.locator('#look-price').innerText(), '$135');
    assert.equal(await page.locator('.gallery-thumbs [data-look="knit-set"]').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('[data-detail]').getAttribute('data-detail'), 'womens-olive-luxe-knit-set');
    await page.locator('[data-size="M"]').click();
    assert.equal(await page.locator('[data-size="M"]').getAttribute('aria-pressed'), 'true');
    if (comingSoon) {
      assert(await page.locator('.coming-soon-action').isDisabled(), 'Coming soon action stays disabled');
      assert.equal(await page.locator('[data-add]').count(), 0, 'No add-to-bag action while coming soon');
      assert.match(await page.locator('#size-stock').innerText(), /opens at launch/);
    }
    await page.locator('.gallery-enlarge').click();
    await page.waitForFunction(() => document.querySelector('#enlarged-image').src.endsWith('olive-luxe-knit-set.svg'));
    await page.keyboard.press('Escape');

    const paths = ['index.html', 'collections.html', 'blackout-hoodie.html', 'bomber-jacket.html', 'lion-sweater.html', 'new-era-hat.html', 'full-kit.html', 'womens.html', 'womens-olive-luxe.html', 'womens-navy-cream.html', 'womens-midnight-black.html', 'womens-blush-pink.html', '404.html'];
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
    fs.writeFileSync('.impeccable/review/smoke-report.json', JSON.stringify({ passed: true, checks: ['Category filters and counts', 'Price sorting', 'Studio and styled photography', 'Size validation', 'Add to bag', 'Quantity and subtotal', 'Test checkout disclosure', 'Escape and dialog behavior', 'Cross-page persisted bag', 'Remove and empty bag', 'Product gallery and enlarged image', 'Studio board switch', 'Shirt and shorts switch', 'Lookbook switch', 'Mobile menu', 'Women’s collection menu, hub, look selector, size guide, and coming-soon state', '78 route and viewport checks'], javascriptErrors: errors, httpErrors: failures }, null, 2));
    console.log('Passed: shopping flows, persistence, gallery controls, mobile menu, women’s collection, and 78 route/viewport checks. No JavaScript or HTTP errors.');
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
