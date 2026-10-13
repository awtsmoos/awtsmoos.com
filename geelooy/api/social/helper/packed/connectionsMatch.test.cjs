// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Unit tests for the Connections citation matcher and loader.
 * Run: node geelooy/api/social/helper/packed/connectionsMatch.test.cjs
 */

const assert = require('node:assert/strict');
const M = require('./connectionsMatch.js');
const { loadConnectionsData, clearConnectionsCache } = require('./connectionsIndex.js');

let passed = 0;
function check(name, fn) {
	try {
		fn();
		passed++;
	} catch (e) {
		console.error('FAIL:', name, '-', e.message);
		process.exitCode = 1;
	}
}

// --- parsePostIdentity ---
check('tanya identity', () => {
	assert.deepEqual(M.parsePostIdentity('tanya-he-la-12'), { corpus: 'tanya', series: 'la', num: 12, slug: null, section: null });
});
check('igeres identity', () => {
	assert.deepEqual(M.parsePostIdentity('igeres-he-v02-0162'), { corpus: 'igeres', series: 'v02', num: 162, slug: null, section: null });
});
check('lt identity', () => {
	assert.deepEqual(M.parsePostIdentity('lt-bamidbar-ch14'), { corpus: 'lt', series: null, num: 14, slug: 'bamidbar', section: null });
});
check('halachah identity with commentary suffix', () => {
	const id = M.parsePostIdentity('halachah-tur-orachchaim-kafhachaim-0671');
	assert.equal(id.corpus, 'halachah-tur');
	assert.equal(id.num, 671);
	assert.equal(id.section, 'orachchaim');
});
check('unknown postId -> null', () => {
	assert.equal(M.parsePostIdentity('some-random-post'), null);
});

// --- synthetic matching ---
function synMap(rows) {
	const m = new Map();
	for (const [key, post] of rows) {
		if (!m.has(key)) m.set(key, []);
		m.get(key).push({ post, para: 1, raw: 'raw' });
	}
	return m;
}
const SYN = synMap([
	['sefer:ספר התניא:פרק יב', 'x-1'],
	['sefer:תניא:פי״ב', 'x-2'],
	['sefer:תניא:פ״ג', 'x-3'],
	['rambam:בתניא', 'x-4'],
	['sefer:מדתניא:פרק יב', 'x-5'],
	['sefer:ספר התניא:לרבנו הזקן - חלק אגרת הקדש', 'x-6'],
	['sefer:לקוטי תורה:במדבר פרק יב', 'x-7'],
	['sefer:לקוטי תורה:בחוקותי פרק יב', 'x-8'],
	['sefer:לקוטי תורה:ברכה צח', 'x-9'],
	['sefer:שולחן ערוך:אורח חיים סימן תרב', 'x-10'],
	['sefer:שולחן ערוך:יורה דעה סימן תרב', 'x-11'],
	['sefer:תניא:פרק יב', 'tanya-he-la-12'],
	['sefer:תניא:שם הערה 15', 'x-12']
]);
const posts = (pid) => M.findIncomingCitations(pid, SYN).map((e) => e.post);

check('tanya chapter markers match', () => {
	assert.deepEqual(posts('tanya-he-la-12'), ['x-1', 'x-2']);
});
check('compact perek perek-3', () => {
	assert.deepEqual(posts('tanya-he-la-03'), ['x-3']);
});
check('rambam kind never matches', () => {
	assert.ok(!posts('tanya-he-la-12').includes('x-4'));
});
check('noise substring מדתניא never matches', () => {
	assert.ok(!posts('tanya-he-la-12').includes('x-5'));
});
check('self-citation excluded from incoming', () => {
	assert.ok(!posts('tanya-he-la-12').includes('tanya-he-la-12'));
});
check('Tanya Igeres key excluded for Rebbe letters corpus', () => {
	assert.deepEqual(posts('igeres-he-v01-0138'), []);
});
check('lt needs parsha + chapter', () => {
	assert.deepEqual(posts('lt-bamidbar-ch12'), ['x-7']);
});
check('bare gematria word צח is not number 98', () => {
	assert.deepEqual(posts('lt-bamidbar-ch98'), []);
});
check('halachah needs section + siman', () => {
	assert.deepEqual(posts('halachah-sa-orachchaim-0602'), ['x-10']);
});
check('footnote הערה 15 is not chapter 15', () => {
	assert.deepEqual(posts('tanya-he-la-15'), []);
});
check('unknown corpus -> empty', () => {
	assert.deepEqual(posts('nope-not-real'), []);
});

// --- loader smoke test on the real index dir ---
check('loader reads real indexes', () => {
	clearConnectionsCache();
	const data = loadConnectionsData();
	assert.ok(data.meta.files.length >= 10, 'expected >= 10 index files, got ' + data.meta.files.length);
	assert.ok(data.meta.forwardPosts > 1000, 'expected forward posts');
	assert.ok(data.meta.reverseKeys > 1000, 'expected reverse keys');
	assert.ok(data.forward.get('tanya-he-la-11').length >= 1, 'tanya-he-la-11 should have outgoing');
});

console.log(`B"H connections matcher tests: ${passed} passed${process.exitCode ? ' (WITH FAILURES)' : ''}.`);
