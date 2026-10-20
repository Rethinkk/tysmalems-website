// Run against the local development server. Requires Playwright and Chromium.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const config = require('../vercel.json');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const headers = Object.fromEntries(config.headers.find(rule => rule.source === '/(.*)').headers.map(h => [h.key.toLowerCase(),h.value]));
const attack = '<img data-attack src=x onerror="window.__injected=1">';
const article = { id: attack, slug: 'security-test', title: attack, standfirst: attack, body: attack, category: attack, journalNumber: attack, status: 'Published', featured: true, publishedAt: '2026-10-20', updatedAt: 'invalid-date', heroMedia: 'javascript:alert(1)', publicShareEnabled: true };
async function run() {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [], violations = [], external = [];
    page.on('pageerror',error => errors.push(error.message));
    page.on('console',message => { if(message.text().includes('Content Security Policy')) violations.push(message.text()); });
    page.on('request',request => { if(new URL(request.url()).origin !== new URL(base).origin) external.push(request.url()); });
    // The development adapter does not implement Vercel's wildcard headers.
    // Apply the exact proposed response headers, so CSP regressions fail here.
    await page.route(`${base}/**`,async route => {
      const response = await route.fetch();
      await route.fulfill({ response, headers: { ...response.headers(), ...headers } });
    });
    for (const path of ['/', '/approach.html', '/insights.html', '/contact.html', '/privacy.html', '/cookies.html', '/cms.html']) {
      await page.goto(base + path);
      assert(await page.locator('h1').count(),path);
    }
    assert.equal((await context.cookies()).length,0,'No application cookies expected');
    await page.evaluate(({attack,article}) => {
      localStorage.setItem('tlJournalArticles',JSON.stringify([article]));
      localStorage.setItem('tlApproachHeroImages',JSON.stringify([{ id: attack, name: attack, src: 'https://untrusted.example/tracker.png' }]));
      localStorage.setItem('tlSocialLinks',JSON.stringify([{ id: 'linkedin', url: 'javascript:alert(1)' }]));
      localStorage.setItem('tlCorporatePages',JSON.stringify([{ slug:'privacy',status:'Published',title:attack,label:attack,intro:attack,updatedAt:'invalid-date',body:'**Bold**\n\n[safe](https://example.test/path)\n\n[bad](javascript:alert(1))\n\n' + attack }]));
    },{attack,article});
    for (const path of ['/insights.html','/article.html?slug=security-test','/privacy.html','/legal.html','/approach.html','/cms.html']) {
      await page.goto(base + path);
      assert.equal(await page.locator('[data-attack]').count(),0,path);
      assert.equal(await page.evaluate(() => window.__injected),undefined,path);
      assert.equal(await page.locator('a[href^="javascript:"],img[src^="javascript:"],img[src^="https://untrusted.example"]').count(),0,path);
    }
    await page.goto(base + '/privacy.html');
    assert.equal(await page.locator('.legal-body strong').first().textContent(),'Bold');
    assert.equal(await page.locator('.legal-body a[href="https://example.test/path"]').count(),1);
    await page.evaluate(() => { for(const key of ['tlJournalArticles','tlApproachHeroImages','tlSocialLinks','tlCorporatePages']) localStorage.setItem(key,'invalid JSON'); });
    for (const path of ['/insights.html','/privacy.html','/approach.html','/cms.html']) {
      await page.goto(base + path); assert(await page.locator('h1').count());
    }
    await page.goto(base + '/contact.html');
    for(const [name,value] of Object.entries({name:'Local check',company:'Local check',email:'test@example.test',country:'NL',message:'Local security check'})) await page.locator(`[name="${name}"]`).fill(value);
    await page.locator('[name="privacy"]').check();
    await page.locator('[data-contact-form] button[type="submit"]').click();
    await page.locator('[data-contact-status]').filter({hasText:'not configured'}).waitFor();
    assert.deepEqual(errors,[],'No script errors');
    assert.deepEqual(violations,[],'No legitimate operation blocked by proposed CSP');
    assert.deepEqual(external,[],'No external browser requests, even with injected image URLs');
    console.log('PASS: seven page workflows with proposed CSP; no application cookies or external requests; hostile CMS markup/links rejected; malformed storage recovers; contact form handles unavailable mail configuration. No email sent.');
  } finally { await browser.close(); }
}
run().catch(error=>{console.error(error);process.exit(1)});
