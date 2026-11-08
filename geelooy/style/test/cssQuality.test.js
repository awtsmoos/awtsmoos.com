// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file cssQuality.test.js
 * @description Guards CSS ownership, visual contracts, and cache-busted import graphs.
 * The Awtsmoos lets every stylesheet wear a changing query while its true path stays bright;
 * Awtsmoos.com tests ideal ownership, motion mercy, and every imported visual light.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const path = require('path');
const { spawnSync } = require('child_process');

const classicCssFiles = [
	'geelooy/style/heichelos/revamped-partials/content.css',
	'geelooy/style/heichelos/revamped-partials/platform-panels.css',
	'geelooy/style/heichelos/revamped-partials/platform-mobile.css',
	'geelooy/style/heichelos/revamped-partials/notifications.css',
	'geelooy/style/heichelos/revamped-partials/notifications-mobile.css',
	'geelooy/style/social/alias.css',
	'geelooy/style/social/profileStyles.css',
	'geelooy/email/css/sidebar.css',
	'geelooy/email/css/composer.css'
];
const visualContractTests = [
	'geelooy/shared/visual/test/findCenteredElement.test.mjs',
	'geelooy/shared/visual/test/createRafScrollBinder.test.mjs',
	'geelooy/heichelos/post/logic/visual/test/scrollBlockerDetectorScope.test.mjs',
	'geelooy/style/test/jsCssStateContract.test.mjs',
	'geelooy/style/test/staleVisualModuleDetector.test.mjs',
	'geelooy/style/test/scrollVisualRegressionGuard.test.mjs',
	'geelooy/style/test/visualDomainContracts.test.js',
	'geelooy/style/test/cssCustomPropertyOwnership.test.js',
	'geelooy/style/test/selectorOwnership.test.js',
	'geelooy/style/test/wrapperExpiration.test.js',
	'geelooy/style/test/reducedMotionContract.test.js'
];
const styleRoot = 'geelooy/heichelos/post/styles';
const idealDirectory = path.join(styleRoot, 'ideal');
const idealFiles = fs.readdirSync(idealDirectory)
	.filter(file => file.endsWith('.css'))
	.map(file => path.join(idealDirectory, file));
const sacredDomain = /\.sidebar\b|\.sidebar\.|hidden-comments|awtsmoos-sidebar(?!-breadcrumbs)|awtsmoos-slide|awtsmoos-view|keeper-|keepers-|awtsmoos-ideal-sidebar|awtsmoos-inline-commentary-root|comment-body-vessel|awtsmoos-floating-controls|awtsmoos-auto-scroll-floating|awtsmoos-sidebar-header-chrome|awtsmoos-chrome-row|awtsmoos-current-view-title|awtsmoos-chrome-btn|fullscreen-mode/;

function read(file) {
	return fs.readFileSync(file, 'utf8');
}

function stripComments(source) {
	return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

function localImportPath(specifier) {
	return String(specifier || '').split(/[?#]/, 1)[0];
}

function importedCssGraph(entry) {
	const seen = new Set();
	const walk = file => {
		const full = path.normalize(file);
		if (seen.has(full)) return;
		seen.add(full);
		const directory = path.dirname(full);
		for (const match of read(full).matchAll(/@import\s+url\(["'](.+?)["']\)/g)) {
			walk(path.join(directory, localImportPath(match[1])));
		}
	};
	walk(path.join(styleRoot, entry));
	return [...seen];
}

function selectorsOf(source) {
	const selectors = [];
	for (const part of stripComments(source).split('}')) {
		const index = part.indexOf('{');
		if (index < 0) continue;
		const raw = part.slice(0, index).trim();
		if (!raw || raw.startsWith('@')) continue;
		raw.split(',').map(item => item.trim()).filter(Boolean)
			.forEach(selector => selectors.push(selector));
	}
	return selectors;
}

function assertNoExactDuplicateBlocks(file) {
	const seen = new Set();
	const duplicates = [];
	const pattern = /([^{}@]+)\{([^{}]+)\}/g;
	let match;
	while ((match = pattern.exec(read(file)))) {
		const selector = match[1].trim().replace(/\s+/g, ' ');
		if (!selector || selector === 'from' || selector === 'to') continue;
		const block = `${selector}{${match[2].trim().replace(/\s+/g, ' ')}}`;
		if (seen.has(block)) duplicates.push(selector);
		seen.add(block);
	}
	assert.deepEqual(duplicates, [], `${file} exact duplicate CSS blocks: ${duplicates.join(', ')}`);
}

// ---- Awtsmoos scale lint (Nov 8, 2026) ----
// ONE shared breakpoint scale (390/560/760/900/1100) and ONE z-index scale
// (tiers 0–69, nothing live above 99) — see geelooy/style/awtsmoos-scale-tokens.css.
// Breakpoints: every @media (max|min)-width in live CSS must be on the scale.
// z-index: no literal >= 9000 anywhere (except the documented exemption in
// the baseline), and no NEW literal in [100, 8999] beyond the grandfathered
// per-file counts in cssScaleBaseline.json. A literal >= 100 ban cannot be
// absolute yet: 258 pre-existing sane values (100–8999) are grandfathered by
// task order ("do NOT touch z-index values below 9000"), so the lint is a
// ratchet — counts may only shrink. New layering must use the 0–69 tiers.
// Excluded from the scan (owned by sibling workers / not live surfaces):
// home-simple (home), reader-content (reader), login, archived agent dirs.
const SCALE_BREAKPOINTS = [390, 560, 760, 900, 1100];
const SCALE_EXCLUDE_PREFIXES = [
	'geelooy/style/home-simple/',
	'geelooy/heichelos/post/styles/reader-content/',
	'geelooy/login/',
	'geelooy/.awtsmoos-agent-transfer/',
	'geelooy/.awtsmoos-agent-thoughts/'
];
const SCALE_TOKENS_FILE = 'geelooy/style/awtsmoos-scale-tokens.css';
const SCALE_BASELINE_FILE = 'geelooy/style/test/cssScaleBaseline.json';

function scaleMapBp(px) {
	if (px < 475) return 390;
	if (px < 660) return 560;
	if (px <= 780) return 760;
	if (px <= 999) return 900;
	return 1100;
}

function scaleWalkCss(dir, out) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (entry.name === 'node_modules' || entry.name === '.git') continue;
			scaleWalkCss(full, out);
		} else if (entry.name.endsWith('.css')) out.push(full);
	}
}

function assertAwtsmoosScales() {
	const tokens = read(SCALE_TOKENS_FILE);
	assert(tokens.includes('390 / 560 / 760 / 900 / 1100'), `${SCALE_TOKENS_FILE} must document the breakpoint scale`);
	assert(tokens.includes('--aw-z-ceiling: 69'), `${SCALE_TOKENS_FILE} must document the z-index ceiling tier`);
	assert(tokens.includes('--aw-z-max: 99'), `${SCALE_TOKENS_FILE} must document the hard z-index ceiling`);
	const baseline = JSON.parse(read(SCALE_BASELINE_FILE));
	assert.equal(baseline.BH, 'B"H', 'scale baseline must begin with B"H');
	assert(baseline.z100to8999 && typeof baseline.z100to8999 === 'object', 'scale baseline must carry z100to8999 counts');
	assert(baseline.exemptions && typeof baseline.exemptions === 'object', 'scale baseline must carry exemptions');

	const files = [];
	scaleWalkCss('geelooy', files);
	const bpOffenders = [];
	const zAbsurdOffenders = [];
	const zRatchetOffenders = [];
	for (const file of files) {
		const normalized = file.replace(/\\/g, '/');
		if (SCALE_EXCLUDE_PREFIXES.some(prefix => normalized.includes(prefix))) continue;
		const source = stripComments(read(file));
		for (const prelude of source.matchAll(/@media[^{]+\{/g)) {
			for (const match of prelude[0].matchAll(/\(\s*(max|min)-width\s*:\s*([\d.]+)\s*(px|rem|em)\s*\)/g)) {
				let px = parseFloat(match[2]);
				if (match[3] !== 'px') px *= 16;
				if (Math.abs(px - scaleMapBp(px)) >= 0.001) {
					bpOffenders.push(`${normalized} :: ${match[1]}-width:${match[2]}${match[3]} (=${px}px, nearest scale ${scaleMapBp(px)})`);
				}
			}
		}
		let ratchetCount = 0;
		for (const match of source.matchAll(/z-index\s*:\s*(-?\d+)/g)) {
			const value = parseInt(match[1], 10);
			if (value >= 9000) {
				const exempt = baseline.exemptions[normalized];
				if (!exempt || exempt[String(value)] === undefined) {
					zAbsurdOffenders.push(`${normalized} :: z-index:${value}`);
				}
			} else if (value >= 100) ratchetCount++;
		}
		const allowed = baseline.z100to8999[normalized] || 0;
		if (ratchetCount > allowed) {
			zRatchetOffenders.push(`${normalized} :: ${ratchetCount} z-index literals in [100,8999], grandfathered ${allowed} — new layering must use the 0–69 tiers in ${SCALE_TOKENS_FILE}`);
		}
	}
	assert.deepEqual(bpOffenders, [], `non-scale breakpoints in live CSS: ${bpOffenders.join('; ')}`);
	assert.deepEqual(zAbsurdOffenders, [], `absurd z-index (>=9000) in live CSS: ${zAbsurdOffenders.join('; ')}`);
	assert.deepEqual(zRatchetOffenders, [], `new z-index >= 100 in live CSS: ${zRatchetOffenders.join('; ')}`);
}

function assertIdealSingleOwner() {
	const owners = new Map();
	for (const file of idealFiles) {
		const local = new Map();
		for (const selector of selectorsOf(read(file))) {
			local.set(selector, (local.get(selector) || 0) + 1);
			if (!owners.has(selector)) owners.set(selector, new Set());
			owners.get(selector).add(file);
		}
		assert.deepEqual([...local].filter(([, count]) => count > 1), [], `${file} repeats ideal selectors`);
	}
	assert.deepEqual([...owners].filter(([, files]) => files.size > 1), [], 'ideal selector cross-file conflicts');
}

function assertOnlyIdealOwnsSacredDomains() {
	const offenders = [];
	for (const file of importedCssGraph('main.css')) {
		const normalized = file.replace(/\\/g, '/');
		const ideal = normalized.includes('/styles/ideal/') || normalized.endsWith('/styles/forever-ui-fixes.css');
		const safe = /\/styles\/reset\//.test(normalized) || /sidebar-breadcrumbs\.css$/.test(normalized) || /polished-shell\.css$/.test(normalized);
		if (ideal || safe) continue;
		read(file).split(/\r?\n/).forEach((line, index) => {
			if (sacredDomain.test(line) && !line.includes('Legacy shim')) offenders.push(`${normalized}:${index + 1}`);
		});
	}
	assert.deepEqual(offenders, [], `non-ideal owners found: ${offenders.join(', ')}`);
}

function assertNoLiveImportant() {
	// B"H — Coby's standing rule (Nov 8): no !important, ever, in served CSS.
	// Counts live declarations only: /* */ comments are stripped first, so prose
	// like "NEVER use !important" does not count. Scans .css files whole, and
	// <style> blocks (noscript included) inside .html files. JS style strings
	// are a separate universe and are not covered here.
	const pendingDeletion = new Set([
		// Dead duplicates / audit pages holding live !important; a sibling worker
		// owns deleting them. They are not served (unlinked, no public route),
		// so they are excluded here until the deletion lands — do not add to this
		// list without a deletion ticket.
		'geelooy/ai/animation/a.html',
		'geelooy/ai/animation/code (1).html',
		'geelooy/ai/animation/code (4).html',
		'geelooy/ai/animation/coy.html',
		'geelooy/apps/editor/old/index.html',
		'geelooy/apps/nesher-studio/tests/.geometry-desktop.html',
		'geelooy/apps/nesher-studio/tests/_realistic_runtime_audit.html'
	]);
	const siblingOwned = (file) => file.includes('geelooy/style/home-simple/') || file.endsWith('home-bundle.css');
	const stripCommentsKeepLines = (source) => source.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
	const offenders = [];
	const walk = (dir) => {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				if (entry.name === 'node_modules' || entry.name === '.git') continue;
				walk(full);
			} else if (/\.(css|html?|htm)$/i.test(entry.name)) {
				const normalized = full.replace(/\\/g, '/');
				if (siblingOwned(normalized) || pendingDeletion.has(normalized)) continue;
				const source = read(full);
				if (/\.css$/i.test(entry.name)) {
					stripCommentsKeepLines(source).split(/\r?\n/).forEach((line, index) => {
						if (line.includes('!important')) offenders.push(`${normalized}:${index + 1}`);
					});
				} else {
					for (const match of source.matchAll(/<style[^>]*>([\s\S]*?)<\/style\s*>/gi)) {
						const baseLine = source.slice(0, match.index).split('\n').length;
						stripCommentsKeepLines(match[1]).split(/\r?\n/).forEach((line, index) => {
							if (line.includes('!important')) offenders.push(`${normalized}:${baseLine + index}`);
						});
					}
					source.split(/\r?\n/).forEach((line, index) => {
						if (/style\s*=\s*"[^"]*!important[^"]*"/.test(line)) offenders.push(`${normalized}:${index + 1} (style attr)`);
					});
				}
			}
		}
	};
	walk('geelooy');
	assert.deepEqual(offenders, [], `live !important in served CSS: ${offenders.join(', ')}`);
}

function assertHomeBundleInSync() {
	// B"H — the homepage bundle is a BUILD ARTIFACT regenerated from its
	// original source files (never hand-edited). Regenerate to a temp file
	// and require it to be byte-identical to the committed bundle, and
	// require the ?v= hash in geelooy/index.html to match
	// sha256(bundle).slice(0,10). If this fails, run:
	//   node geelooy/style/home-simple/build-bundle.mjs
	// and update the ?v= hash in geelooy/index.html to the new hash.
	const bundlePath = 'geelooy/style/home-simple/home-bundle.css';
	const builderPath = 'geelooy/style/home-simple/build-bundle.mjs';
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-bundle-'));
	const tmpBundle = path.join(tmpDir, 'home-bundle.css');
	try {
		const result = spawnSync(process.execPath, [builderPath, tmpBundle], { encoding: 'utf8' });
		if (result.status !== 0) throw new Error(`bundle builder failed\n${result.stdout}\n${result.stderr}`);
		const fresh = read(tmpBundle);
		const committed = read(bundlePath);
		assert.equal(fresh, committed, `${bundlePath} is out of sync with its sources — regenerate with: node ${builderPath}`);
		const hash = crypto.createHash('sha256').update(committed).digest('hex').slice(0, 10);
		const indexHtml = read('geelooy/index.html');
		assert(indexHtml.includes(`home-bundle.css?v=${hash}`), `geelooy/index.html ?v= must be ${hash} (sha256 of ${bundlePath})`);
	} finally {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	}
}

assertNoLiveImportant();
assert.deepEqual(classicCssFiles, [...new Set(classicCssFiles)]);
classicCssFiles.forEach(file => {
	assert.doesNotMatch(read(file), /z-index:\s*999999/);
	if (file.endsWith('profileStyles.css')) assert.doesNotMatch(read(file), /(^|\n)\.hidden\s*\{/);
	assertNoExactDuplicateBlocks(file);
});
idealFiles.forEach(assertNoExactDuplicateBlocks);
assertIdealSingleOwner();
assertOnlyIdealOwnsSacredDomains();
assertAwtsmoosScales();
assertHomeBundleInSync();
for (const file of visualContractTests) {
	const result = spawnSync(process.execPath, [file], { encoding: 'utf8' });
	if (result.status !== 0) throw new Error(`${file} failed\n${result.stdout}\n${result.stderr}`);
}
console.log('B"H cssQuality.test passed with ideal ownership, visual contracts, cache-safe imports, and the Awtsmoos breakpoint/z-index scale lint');
