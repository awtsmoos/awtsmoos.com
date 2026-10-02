// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TunnelResultView
 * @description
 * The Awtsmoos lets Awtsmoos.com reveal success, failure, and the next clear deed;
 * raw diagnostics remain available, yet the human-visible meaning always takes the lead.
 */

export function humanError(value) {
	if (!value) return "unknown error";
	if (typeof value === "string") return value;
	if (value.message) return humanError(value.message);
	if (value.error) return humanError(value.error);
	return "Request failed.";
}

export function resultCard(value) {
	const data = normalizeResult(value);
	const wrap = document.createElement("div");
	wrap.className = `awt-result-card ${data.ok ? "awt-result-ok" : "awt-result-error"}`;
	wrap.append(line("strong", data.title), line("p", data.summary));
	if (Array.isArray(value?.previewLinks)) wrap.append(previewLinks(value.previewLinks));
	if (data.focus) wrap.append(focusBox(data.focus));
	if (data.next) wrap.append(line("p", data.next, "awt-result-next"));
	wrap.append(rawDetails(data.raw));
	return wrap;
}

function normalizeResult(value) {
	const ok = value?.ok !== false && !value?.error;
	const action = value?.action ? ` ${value.action}` : "";
	const status = value?.status || value?.statusCode;
	const title = ok ? `Success${action}` : `Action failed${action}${status ? ` · ${status}` : ""}`;
	const focus = value?.responseFocus || value?.awtsmoosNext || value?.aiGuidance?.responseFocus || null;
	const summary = value?.previewInstruction || focus?.oneMainThing || (ok ? successSummary(value) : failureSummary(value, value?.code || value?.error));
	const next = ok ? successNext(value, focus) : failureNext(value?.code || value?.error);
	return { ok, title, summary, focus, next, raw: safeJson(value) };
}

function successSummary(value) {
	if (value?.uiMessage) return value.uiMessage;
	if (value?.viewUrl) return `Preview ready: ${value.viewUrl}`;
	if (value?.taskId) return `Task spawned: ${value.taskId}.`;
	if (Array.isArray(value?.tasks)) return `${value.tasks.length} task records loaded.`;
	if (Array.isArray(value?.agents)) return `${value.agents.length} agents loaded.`;
	return "The request completed.";
}

function successNext(value, focus) {
	if (value?.viewUrl) return "Open the private preview link or grant access from Preview Gateway.";
	if (focus?.nextAction?.action) return `Run ${focus.nextAction.action} next.`;
	return value?.taskId ? "Use Check status or Get result with this task id." : "Open diagnostics only if you need the exact JSON.";
}

function failureSummary(value, code) {
	if (code === "INVALID_ROUTE") return "The server route did not match this request.";
	if (code === "missing_active_api_key") return "This action needs an active API key or OAuth session scope.";
	if (code === "no_connected_tunnel") return "No matching local tunnel is connected for this action.";
	return humanError(value);
}

function failureNext(code) {
	if (code === "no_connected_tunnel") return "Use a connected tunnel, or switch to awtsmoos-virtual-os / targetVessel=virtual-os.";
	return "Open diagnostics for exact status, route, and server details.";
}

function previewLinks(links) {
	const box = document.createElement("section");
	box.className = "awt-preview-links";
	box.append(line("small", "LIVE PREVIEW LINKS"));
	for (const link of links) {
		const anchor = document.createElement("a");
		anchor.href = link.viewUrl;
		anchor.target = "_blank";
		anchor.rel = "noopener";
		anchor.textContent = `${link.title || link.id} · ${link.accessSummary || link.visibility || "private"}`;
		box.append(anchor);
	}
	return box;
}

function focusBox(focus) {
	const box = document.createElement("section");
	box.className = "awt-response-focus";
	box.append(line("small", "ONE MAIN THING"), line("strong", focus.oneMainThing || focus.prompt || "Continue with the next verified action."));
	if (focus.nextAction?.action) box.append(line("code", `next: ${focus.nextAction.action}`));
	if (focus.mustAnswerGate) box.append(line("p", "Answer the completion gate before any final answer."));
	return box;
}

function rawDetails(raw) {
	const details = document.createElement("details");
	details.className = "awt-raw-details";
	details.append(line("summary", "Diagnostics / raw response"), line("pre", raw));
	return details;
}

function line(tag, text, className = "") {
	const element = document.createElement(tag);
	if (className) element.className = className;
	element.textContent = String(text ?? "");
	return element;
}

function safeJson(value) {
	try { return JSON.stringify(value, null, 2).slice(0, 24000); }
	catch { return String(value).slice(0, 24000); }
}
