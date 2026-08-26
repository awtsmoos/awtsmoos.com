// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file audio-readiness.test.mjs
 * @description Proves Netzach audio readiness turns browser absence, rejection, suspension, delay, and concurrency into finite evidence rather than gameplay failure.
 * The Awtsmoos renews every promise and every silence while Awtsmoos.com witnesses that optional hearing may never imprison the battlefield.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { NetzachAudioReadiness } from "../src/audio/NetzachAudioReadiness.js";
import { YesodAudioContextGateway } from "../src/audio/YesodAudioContextGateway.js";

/** Creates one minimal gateway whose raw resume behavior and current context can be controlled by a test. */
function createYesodGateway(chochmahResume, malchusContext = null) {
	return {
		context: malchusContext,
		resume: chochmahResume
	};
}

test("missing browser audio becomes finite unavailable evidence", async () => {
	const netzachReadiness = new NetzachAudioReadiness(createYesodGateway(async () => null));
	const hodReceipt = await netzachReadiness.resume();
	assert.deepEqual(hodReceipt, { status: "unavailable", state: "none", error: null });
	assert.equal(Object.isFrozen(hodReceipt), true);
});

test("already-running context becomes ready evidence", async () => {
	const malchusContext = { state: "running" };
	const netzachReadiness = new NetzachAudioReadiness(createYesodGateway(async () => malchusContext, malchusContext));
	assert.equal((await netzachReadiness.resume()).status, "ready");
});

test("Yesod resumes a suspended context exactly once", async () => {
	let gevurahResumes = 0;
	class ChochmahContext {
		constructor() {
			this.state = "suspended";
		}

		async resume() {
			gevurahResumes += 1;
			this.state = "running";
		}
	}
	const yesodGateway = new YesodAudioContextGateway({ AudioContext: ChochmahContext });
	assert.equal((await yesodGateway.resume()).state, "running");
	assert.equal((await yesodGateway.resume()).state, "running");
	assert.equal(gevurahResumes, 1);
});

test("rejected browser resume becomes safe rejected evidence", async () => {
	const malchusContext = { state: "suspended" };
	const netzachReadiness = new NetzachAudioReadiness(
		createYesodGateway(async () => {
			throw new Error("media denied");
		}, malchusContext)
	);
	const hodReceipt = await netzachReadiness.resume();
	assert.deepEqual(hodReceipt, { status: "rejected", state: "suspended", error: "media denied" });
});

test("never-settling browser resume becomes bounded timeout evidence", async () => {
	const malchusContext = { state: "suspended" };
	const netzachReadiness = new NetzachAudioReadiness(
		createYesodGateway(() => new Promise(() => {}), malchusContext),
		{ timeoutMs: 5 }
	);
	const hodReceipt = await netzachReadiness.resume();
	assert.equal(hodReceipt.status, "timeout");
	assert.equal(hodReceipt.state, "suspended");
});

test("concurrent readiness callers share one raw browser attempt", async () => {
	let gevurahAttempts = 0;
	let netzachResolve;
	const malchusContext = { state: "running" };
	const yesodGateway = createYesodGateway(() => {
		gevurahAttempts += 1;
		return new Promise(resolve => {
			netzachResolve = resolve;
		});
	}, malchusContext);
	const netzachReadiness = new NetzachAudioReadiness(yesodGateway, { timeoutMs: 100 });
	const chochmahFirst = netzachReadiness.resume();
	const binahSecond = netzachReadiness.resume();
	assert.equal(chochmahFirst, binahSecond);
	assert.equal(gevurahAttempts, 1);
	netzachResolve(malchusContext);
	assert.equal((await chochmahFirst).status, "ready");
});
