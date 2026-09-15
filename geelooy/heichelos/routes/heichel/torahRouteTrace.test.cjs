//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	contextText,
	traceAsync,
	traceEnabled
} = require('./torahRouteTrace.js');

/**
 * @file Opt-in Torah cold-path timing regressions.
 * @description The Awtsmoos permits bounded operational testimony without changing learner-visible values, errors, or ordinary silent operation.
 */
function withTraceEnv(value, task) {
	const previous = process.env.AWTSMOOS_TORAH_TRACE;
	if (value === undefined) delete process.env.AWTSMOOS_TORAH_TRACE;
	else process.env.AWTSMOOS_TORAH_TRACE = value;
	return Promise.resolve()
		.then(task)
		.finally(() => {
			if (previous === undefined) delete process.env.AWTSMOOS_TORAH_TRACE;
			else process.env.AWTSMOOS_TORAH_TRACE = previous;
		});
}

function captureErrors(task) {
	const previous = console.error;
	const lines = [];
	console.error = (...values) => lines.push(values.join(' '));
	return Promise.resolve()
		.then(task)
		.then(result => ({ result, lines }))
		.finally(() => { console.error = previous; });
}

test('trace is silent and preserves result when disabled', async () => {
	await withTraceEnv(undefined, async () => {
		assert.equal(traceEnabled(), false);
		const captured = await captureErrors(() => traceAsync('stage', async () => 'value', { postId: 'P1' }));
		assert.equal(captured.result, 'value');
		assert.deepEqual(captured.lines, []);
	});
});

test('trace emits bounded start and finish lines when enabled', async () => {
	await withTraceEnv('1', async () => {
		assert.equal(traceEnabled(), true);
		const captured = await captureErrors(() => traceAsync('reader-data:post', async () => 7, { postId: 'P1' }));
		assert.equal(captured.result, 7);
		assert.equal(captured.lines.length, 2);
		assert.match(captured.lines[0], /start reader-data:post 0ms postId=P1/u);
		assert.match(captured.lines[1], /finish reader-data:post \d+ms postId=P1/u);
	});
});

test('trace preserves thrown error identity while emitting error timing', async () => {
	await withTraceEnv('1', async () => {
		const expected = new Error('BH rupture');
		const previous = console.error;
		const lines = [];
		console.error = (...values) => lines.push(values.join(' '));
		try {
			await assert.rejects(() => traceAsync('broken', async () => { throw expected; }), error => error === expected);
		} finally {
			console.error = previous;
		}
		assert.equal(lines.length, 2);
		assert.match(lines[1], /error broken \d+ms error=BH rupture/u);
	});
});

test('context text omits empty values and bounds long fields', () => {
	const text = contextText({ empty: '', postId: 'P1', huge: 'x'.repeat(400) });
	assert.doesNotMatch(text, /empty=/u);
	assert.match(text, /postId=P1/u);
	assert.ok(text.length < 220, `context unexpectedly large: ${text.length}`);
});
