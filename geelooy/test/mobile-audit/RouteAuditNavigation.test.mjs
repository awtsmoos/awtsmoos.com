//B"H
//Boruch Hashem
//Blessed be He
/**
	* @file RouteAuditNavigation.test.mjs
	* @description Proves route changes use Page.navigate, repeated viewport audits use
	* Page.reload, and timeout recovery requires exact URL plus a fresh document epoch.
	*/

import test from "node:test";
import assert from "node:assert/strict";
import { navigateForAudit } from "./RouteAuditNavigation.mjs";

const TARGET = "http://127.0.0.1:8799/drive/";
const BLANK = { href: "about:blank", readyState: "complete", timeOrigin: 1 };

test("successful route change uses Page.navigate", async () => {
	const calls = [];
	const client = { async send(method) {
		calls.push(method);
		if (method === "Runtime.evaluate") return evaluation(BLANK);
		return { frameId: "one" };
	} };
	assert.deepEqual(await navigateForAudit(client, TARGET), { frameId: "one" });
	assert.deepEqual(calls, ["Runtime.evaluate", "Page.navigate"]);
});

test("timed-out route change recovers from exact target testimony", async () => {
	let evaluations = 0;
	const client = { async send(method) {
		if (method === "Runtime.evaluate") return evaluation(evaluations++ ? targetEvidence(2) : BLANK);
		throw new Error("CDP timeout after 6000ms: Page.navigate");
	} };
	const result = await navigateForAudit(client, TARGET);
	assert.equal(result.recoveredFromTimeout, true);
	assert.equal(result.href, TARGET);
});

test("same URL uses Page.reload instead of Page.navigate", async () => {
	const calls = [];
	const client = { async send(method) {
		calls.push(method);
		if (method === "Runtime.evaluate") return evaluation(targetEvidence(5));
		return {};
	} };
	await navigateForAudit(client, TARGET);
	assert.deepEqual(calls, ["Runtime.evaluate", "Page.reload"]);
});

test("non-navigation transport errors remain fatal", async () => {
	const client = { send: async () => { throw new Error("socket closed"); } };
	await assert.rejects(() => navigateForAudit(client, TARGET), /socket closed/);
});

/** @param {object} value Runtime value. @returns {object} CDP evaluation envelope. */
function evaluation(value) { return { result: { value } }; }
/** @param {number} timeOrigin Document epoch. @returns {object} Target evidence. */
function targetEvidence(timeOrigin) { return { href: TARGET, readyState: "interactive", timeOrigin }; }
