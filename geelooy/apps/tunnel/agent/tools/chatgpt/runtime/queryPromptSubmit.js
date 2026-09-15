//B"H
// Boruch Hashem
// Blessed is He

const Chrome = require("../../chrome/actions.js");
const Contract = require("./queryPromptContract.js");
const TargetSession = require("./queryPromptTargetSession.js");

/**
 * @file Creates one persistent ChatGPT conversation from an exact ?prompt query value.
 * @description The Awtsmoos binds hydration, trusted input and persistence to one exact target;
 * parallel Shliach tabs cannot steal each other's CDP page, and no composer text is ever mutated.
 */
async function waitReady(session, expectedPrompt, timeoutMs, sleep) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		const state = await session.evaluate(Contract.readyExpression(expectedPrompt));
		if (Contract.ready(state)) return state;
		await sleep(200);
	}
	throw new Error("query_prompt_not_ready");
}

async function waitPersisted(session, expectedPrompt, timeoutMs, sleep) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		const state = await session.evaluate(Contract.persistenceExpression(expectedPrompt));
		if (state?.persisted === true && state.conversationId) return state;
		await sleep(200);
	}
	throw new Error("query_prompt_persistence_unconfirmed");
}

async function submit(input = {}, overrides = {}) {
	const deps = {
		newPage: overrides.newPage || Chrome.chromeNewPage,
		connectSession: overrides.connectSession || TargetSession.connect,
		close: overrides.close || Chrome.chromeClosePage,
		sleep: overrides.sleep || sleep
	};
	const port = Number(input.port);
	const timeoutMs = Number(input.timeoutMs || 60000);
	const expectedPrompt = Contract.promptFromUrl(input.url);
	if (!expectedPrompt) throw new Error("query_prompt_missing");
	const opened = await deps.newPage({
		port,
		url: input.url,
		shared: true,
		autoLaunch: false
	});
	const targetId = opened?.chromeTargetId || opened?.target?.id || opened?.pageId;
	if (!opened?.ok || !targetId) throw new Error(opened?.error || "query_prompt_tab_open_failed");
	let session = null;
	try {
		session = await deps.connectSession(port, targetId, Math.min(timeoutMs, 15000));
		const before = await waitReady(session, expectedPrompt, timeoutMs, deps.sleep);
		await deps.sleep(Number(input.hydrationStabilityMs ?? 500));
		const stable = await waitReady(session, expectedPrompt, Math.min(timeoutMs, 10000), deps.sleep);
		await session.click(stable.rect);
		const after = await waitPersisted(session, expectedPrompt, timeoutMs, deps.sleep);
		session.close();
		session = null;
		const closed = await closeTarget(deps, port, targetId);
		return {
			ok: true,
			sent: true,
			persisted: true,
			closed,
			chromeTargetId: targetId,
			conversationId: after.conversationId,
			href: after.href,
			before,
			stable,
			after
		};
	} catch (error) {
		if (session) session.close();
		if (input.closeOnFailure !== false) await closeTarget(deps, port, targetId).catch(() => {});
		throw error;
	}
}

async function closeTarget(deps, port, targetId) {
	const result = await deps.close({
		port,
		chromeTargetId: targetId,
		pageId: targetId,
		shared: true,
		inspectShared: true,
		force: true
	});
	if (!result?.ok) throw new Error(result?.error || "query_prompt_tab_close_failed");
	return true;
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
	SEND_SELECTOR: Contract.SEND_SELECTOR,
	stateExpression: Contract.readyExpression,
	submit,
	waitPersisted,
	waitReady
};
