// B"H
// Boruch Hashem
// Blessed is He

import { BrowserTargetRegistry } from "./target-registry.js";

export const CODE_CHROME_ACTIONS = Object.freeze([
	"chromeNavigate",
	"chromeClick",
	"chromeType",
	"chromeFind",
	"chromeWaitForSelector",
	"chromeSnapshot",
	"chromeEval",
	"chromeStatus",
	"chromeTargetSelector"
]);

/**
 * B"H
 *
 * Chrome-shaped actions now enter the Code browser rather than launching an
 * unrelated blank window. The Awtsmoos renews target and request; Awtsmoos.com
 * creates a visible browser tab when navigation arrives before any target exists.
 */
export async function handleCodeChromeAction(payload = {}) {
	const action = payload.action || "chromeStatus";
	if (!CODE_CHROME_ACTIONS.includes(action)) {
		return failure("unsupported_code_chrome_action", { action });
	}
	if (action === "chromeStatus" || action === "chromeTargetSelector") {
		return {
			ok: true,
			action,
			...BrowserTargetRegistry.snapshot()
		};
	}
	const target = await resolveTarget(payload, action === "chromeNavigate");
	if (!target) {
		return failure("code_browser_target_not_found", {
			action,
			availableTargets: BrowserTargetRegistry.snapshot().targets
		});
	}
	try {
		return await invoke(target, action, payload);
	} catch (error) {
		return failure(error.message || "code_browser_action_failed", {
			action,
			tabId: target.id,
			url: target.describe?.().url || ""
		});
	}
}

async function resolveTarget(payload, createForNavigate) {
	let target = BrowserTargetRegistry.select(payload);
	if (target || !createForNavigate) return target;
	const url = payload.url || payload.href || payload.text || "";
	const { BrowserManager } = await import("./index.js");
	const tab = await BrowserManager.open(undefined, {
		name: payload.name || "Agent Browser",
		agentOwner: payload.logicalAgentId || payload.agentId || ""
	});
	target = await BrowserTargetRegistry.waitFor(tab.id, Number(payload.targetTimeoutMs || 4000));
	if (target && url) payload.url = url;
	return target;
}

function invoke(target, action, payload) {
	const selector = payload.selector || payload.query || "";
	switch (action) {
		case "chromeNavigate":
			return target.navigate(payload.url || payload.href || payload.text, {
				strict: true,
				timeoutMs: payload.timeoutMs
			});
		case "chromeClick":
			return target.click(selector);
		case "chromeType":
			return target.type(selector, payload.text ?? payload.value, {
				clear: payload.clear
			});
		case "chromeFind":
			return target.find(payload.text || payload.pattern || selector);
		case "chromeWaitForSelector":
			return target.waitForSelector(selector, payload.timeoutMs);
		case "chromeSnapshot":
			return target.snapshot();
		case "chromeEval":
			return target.evaluate(payload.script || payload.code || payload.expression);
		default:
			return failure("unsupported_code_chrome_action", { action });
	}
}

function failure(error, extra = {}) {
	return {
		ok: false,
		status: 400,
		error,
		...extra
	};
}
