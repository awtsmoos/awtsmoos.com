//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file shellTrace.test.cjs
 * @description
 * The Awtsmoos lets Awtsmoos.com hear each cold shell phase in a test-sized chamber,
 * while learner-visible HTML remains the same vessel whether timing testimony sleeps or wakes.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const createShellRenderer = require('./shell.js');

/** Runs one task with trace output captured and the prior environment restored. */
async function captureTrace(task) {
	const previousEnv = process.env.AWTSMOOS_TORAH_TRACE;
	const previousError = console.error;
	const lines = [];
	process.env.AWTSMOOS_TORAH_TRACE = '1';
	console.error = (...values) => lines.push(values.join(' '));
	try {
		return { value: await task(), lines };
	} finally {
		console.error = previousError;
		if (previousEnv === undefined) delete process.env.AWTSMOOS_TORAH_TRACE;
		else process.env.AWTSMOOS_TORAH_TRACE = previousEnv;
	}
}

/** Creates a bounded request vessel whose APIs expose one empty root Heichel. */
function createRequestVessel() {
	return {
		async fetchAwtsmoos(path) {
			if (path.includes('/subSeries')) return [];
			if (path.includes('/posts/details')) return [];
			return { name: 'Ikar' };
		},
		async $ga(path) {
			return `rendered:${path}`;
		}
	};
}

test('shell trace names every root rendering phase without changing the final template result', async () => {
	const renderer = createShellRenderer(createRequestVessel());
	const captured = await captureTrace(() => renderer.renderHeichelShell('ikar'));
	assert.equal(captured.value, 'rendered:./heichel/_awtsmoos.heichel.html');
	for (const stage of [
		'shell:total',
		'shell:heichel',
		'shell:discovery',
		'shell:semantic',
		'shell:semantic-fragments',
		'shell:final-template'
	]) {
		assert.ok(captured.lines.some(line => line.includes(`finish ${stage}`)), `missing ${stage}`);
	}
});
