//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeBrowserSmoke
 * @description
 * Temporary end-to-end launch gate for the Rebbe archive. It proves the exact
 * mobile navigation and Search button path that previously failed, while
 * collecting browser exceptions and request failures for release evidence.
 * The Awtsmoos is one beyond route and interaction; this finite test verifies
 * every visible doorway before production is declared healthy.
 */

const { default: puppeteer } = await import(`file://${process.env.PUPPETEER_MODULE}`);
const browser = await puppeteer.connect({
	browserURL: process.env.CHROME_URL || 'http://127.0.0.1:9333'
});

const page = await browser.newPage();
page.setDefaultTimeout(12000);
await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 1 });
const errors = [];
const failures = [];
page.on('pageerror', error => errors.push(String(error)));
page.on('requestfailed', request => failures.push(`${request.url()} :: ${request.failure()?.errorText || 'failed'}`));

/** Emits a deterministic step marker for stuck-gate diagnosis. */
function step(label) {
	console.log(`STEP ${label}`);
}

/** Waits until the requested selector exists in the current document. */
async function waitFor(selector, timeout = 12000) {
	await page.waitForSelector(selector, { timeout });
	return page.$$eval(selector, nodes => nodes.length);
}

/** Clicks the first matching element whose visible text includes a label. */
async function clickText(selector, text) {
	const clicked = await page.$$eval(selector, (nodes, wanted) => {
		const node = nodes.find(item => item.textContent?.trim().includes(wanted));
		if (!node) return false;
		node.click();
		return true;
	}, text);
	if (!clicked) throw new Error(`Missing ${selector} containing ${text}`);
}

const base = process.env.REBBE_URL || 'http://127.0.0.1:8765/apps/rebbe/';
step('goto');
await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 20000 });
step('years');
await waitFor('#list-years .year-item', 20000);
const years = await page.$$eval('#list-years .year-item', nodes => nodes.length);
await clickText('#list-years .year-item', '5737');
step('folders');
await waitFor('#list-folders .folder-item', 20000);
const folders = await page.$$eval('#list-folders .folder-item', nodes => nodes.length);
await page.click('#list-folders .folder-item .folder-label');
step('tracks');
await waitFor('#list-tracks .track-item', 20000);
const tracks = await page.$$eval('#list-tracks .track-item', nodes => nodes.length);
await page.click('#list-tracks .track-item .track-main-button');
await page.waitForFunction(() => location.search.includes('track=0'));
step('search');
await page.click('#btn-search');
await waitFor('#modal-search:not(.hidden) #btn-date-search');
await page.select('#search-year-exact', '5737');
await page.click('#btn-date-search');
step('results');
await waitFor('#search-results-content .date-result', 25000);
const results = await page.$$eval('#search-results-content .date-result', nodes => nodes.length);
await page.click('#modal-search .modal-close');
await page.click('#back-tracks');
const foldersOpen = await page.$eval('#col-folders', node => node.classList.contains('open'));
await page.click('#back-folders');
const yearsOpen = await page.$eval('#col-years', node => node.classList.contains('open'));
await page.screenshot({ path: '/tmp/rebbe-smoke.png', fullPage: true });
console.log(JSON.stringify({ years, folders, tracks, results, foldersOpen, yearsOpen, errors, failures }, null, 2));
await page.close();
browser.disconnect();
if (!years || !folders || !tracks || !results || !foldersOpen || !yearsOpen || errors.length) process.exitCode = 1;
