// B"H
import { parseFallbackToolCalls, normalizeNativeToolCalls } from "./toolCallParser.js";
import { reasoningEvent, statusEvent, toolCallEvent, toolResultEvent } from "./providerEvents.js";
import { DEFAULT_NEXT_STEP_PROMPT } from "./nextStepTool.js";

const TOOL_WARN_MS = 1200;
const TOOL_TIMEOUT_MS = 65000;
const COUNCIL_START_TIMEOUT_MS = 20000;

/**
 * B"H
 * Chapter 253: The Lead Lit The Council Before Beginning Its Own Work.
 *
 * A local/endpoint agent with the canonical council action starts an idempotent
 * website mission before its first provider round. Start is non-blocking: a
 * saved ChatGPT session launches the specialists, while missing login opens one
 * visible login vessel and the lead continues useful work immediately.
 */
export class MultiPassToolAgent {
	constructor({
		client,
		bridge,
		providerId = "provider",
		maxRounds = 6,
		emitEvent = null,
		autoWebsiteMission = true
	} = {}) {
		this.client = client;
		this.bridge = bridge;
		this.providerId = providerId;
		this.maxRounds = maxRounds;
		this.emitEvent = emitEvent || (() => {});
		this.autoWebsiteMission = autoWebsiteMission !== false;
		this.nextStepIntent = null;
		this.websiteMission = null;
	}

	async run({
		prompt,
		messages,
		model,
		stream = true,
		signal,
		onDelta,
		onMetrics,
		missionNamespace = ""
	} = {}) {
		this.nextStepIntent = null;
		this.websiteMission = null;
		const taskPrompt = String(prompt || latestUserText(messages) || "").trim();
		this.websiteMission = await this.startDefaultWebsiteMission({
			prompt: taskPrompt,
			missionNamespace,
			signal
		});
		let history = Array.isArray(messages)
			? [...messages]
			: [{ role: "user", content: this.instructions(taskPrompt) }];
		history = withCoordinationNotice(history, this.websiteMission);
		const trace = [];
		let final = null;
		for (let round = 0; round < this.maxRounds; round += 1) {
			this.assertAlive(signal);
			const response = await this.round({
				round,
				history,
				model,
				stream,
				signal,
				onMetrics
			});
			const calls = this.callsFrom(response);
			this.flushPreToolText(response, calls, round);
			trace.push({ round, text: response.text || "", calls });
			if (!calls.length) {
				final = response;
				break;
			}
			history.push(this.assistantMessage(response, calls));
			for (const call of calls) {
				history.push(await this.toolMessage(call, signal));
			}
		}
		if (!final) {
			final = await this.forceFinal({
				history,
				model,
				stream,
				signal,
				onDelta,
				onMetrics,
				trace
			});
		}
		if (final) final.awtsmoosNextStep = this.nextStepIntent;
		return {
			ok: Boolean(final),
			text: final?.text || "",
			final,
			trace,
			rounds: trace.length,
			nextStep: this.nextStepIntent,
			websiteMission: this.websiteMission
		};
	}

	async startDefaultWebsiteMission({ prompt, missionNamespace, signal }) {
		if (!this.autoWebsiteMission || !prompt || !this.bridge?.call) return null;
		const actions = schemaNames(this.bridge.schemas?.() || []);
		const action = preferredCouncilAction(actions);
		if (!action) return null;
		const websiteMissionId = automaticMissionId(missionNamespace, prompt);
		const call = {
			id: `auto-council-${websiteMissionId}`,
			name: action,
			arguments: {
				mode: "website-mission",
				prompt,
				message: prompt,
				websiteMissionId,
				reuseExisting: true,
				automatic: true
			}
		};
		this.emitEvent(statusEvent(
			"Starting the default authenticated website-agent council.",
			{ message: "Starting website-agent council…", action, websiteMissionId },
			this.providerId
		));
		try {
			let result = await withTimeout(
				this.bridge.call(action, call.arguments),
				COUNCIL_START_TIMEOUT_MS,
				"website council start",
				signal
			);
			if (!result?.ok && result?.error === "website_mission_already_exists") {
				result = await this.readExistingWebsiteMission(actions, websiteMissionId, signal) || result;
			}
			const summary = publicMissionSummary(result, websiteMissionId, action);
			this.emitEvent(toolResultEvent(call, summary, this.providerId));
			return summary;
		} catch (error) {
			const summary = {
				ok: false,
				action,
				websiteMissionId,
				error: error?.message || String(error),
				leadContinues: true
			};
			this.emitEvent(toolResultEvent(call, summary, this.providerId));
			return summary;
		}
	}

	async readExistingWebsiteMission(actions, websiteMissionId, signal) {
		const action = actions.find(name => unqualified(name) === "websiteAgentMissionStatus") ||
			actions.find(name => unqualified(name) === "aiAgentWebsiteMissionStatus");
		if (!action) return null;
		return await withTimeout(
			this.bridge.call(action, { websiteMissionId }),
			COUNCIL_START_TIMEOUT_MS,
			"website council status",
			signal
		);
	}

	async round({ round, history, model, stream, signal, onMetrics }) {
		const segment = `round-${round}`;
		const vessel = { text: "", emittedPreToolText: false, sawTool: false };
		const response = await this.client.complete({
			messages: history,
			model,
			tools: this.bridge.schemas(),
			stream,
			signal,
			onMetrics,
			onDelta: stream
				? (_delta, fullText) => this.captureRoundText(vessel, segment, fullText)
				: null,
			onReasoning: (_chunk, full) =>
				this.emitEvent(reasoningEvent(full, this.providerId, `${segment}:reasoning`)),
			onToolCall: tools => this.captureToolCalls(vessel, segment, tools)
		});
		response.awtsmoosRoundVessel = vessel;
		return response;
	}

	captureRoundText(vessel, segment, fullText) {
		vessel.text = String(fullText || "");
		if (vessel.sawTool) {
			this.emitEvent(reasoningEvent(
				vessel.text,
				this.providerId,
				`${segment}:visible-after-tools`
			));
		}
	}

	captureToolCalls(vessel, segment, tools = []) {
		if (!vessel.sawTool && String(vessel.text || "").trim()) {
			vessel.emittedPreToolText = true;
			this.emitEvent(reasoningEvent(
				vessel.text,
				this.providerId,
				`${segment}:visible-before-tools`
			));
		}
		vessel.sawTool = true;
		tools.forEach(tool =>
			this.emitEvent(toolCallEvent(this.normalizeOne(tool), this.providerId))
		);
	}

	flushPreToolText(response = {}, calls = [], round = 0) {
		const vessel = response.awtsmoosRoundVessel || {};
		if (!calls.length || vessel.emittedPreToolText || !String(response.text || "").trim()) return;
		this.emitEvent(reasoningEvent(
			response.text,
			this.providerId,
			`round-${round}:visible-before-tools`
		));
	}

	async forceFinal({ history, model, stream, signal, onDelta, onMetrics, trace }) {
		this.emitEvent(statusEvent(
			"Tool round limit reached; asking provider for final answer.",
			{ message: "Tool round limit reached." },
			this.providerId
		));
		const finalPrompt = {
			role: "user",
			content: "B'H now give the final visible answer from the tool results above. Do not call more tools."
		};
		const response = await this.client.complete({
			messages: [...history, finalPrompt],
			model,
			tools: [],
			stream,
			signal,
			onMetrics,
			onDelta: stream ? onDelta : null,
			onReasoning: (_chunk, full) =>
				this.emitEvent(reasoningEvent(full, this.providerId, "final:reasoning"))
		});
		trace.push({ round: "final", text: response.text || "", calls: [] });
		return response;
	}

	instructions(prompt = "") {
		return `${prompt}\n\nB'H TOOL PROTOCOL: A website-agent council is started automatically when the authenticated local/endpoint vessel exposes it. Continue useful lead work immediately even while login or delegates are pending. Use direct essential tool calls when available. Use repo-relative paths. For rare actions, call awtsmoos_tool_details, then awtsmoos_tool_call with {name, arguments}. If any useful work remains after your final visible answer, call awtsmoos_needs_next_step with {"needed":true,"prompt":"optional exact next prompt"} immediately before the final answer. If native tool_calls are unavailable, respond only with JSON: {"awtsmoos_tool_calls":[{"name":"tool_name","arguments":{}}]}. After tool results, answer normally.`;
	}

	callsFrom(response = {}) {
		const native = normalizeNativeToolCalls(
			response.toolCalls || response.json?.choices?.[0]?.message?.tool_calls || []
		);
		return native.length ? native : parseFallbackToolCalls(response.text || "");
	}

	assistantMessage(response = {}, calls = []) {
		const message = response.json?.choices?.[0]?.message;
		if (message?.tool_calls?.length) return message;
		return {
			role: "assistant",
			content: response.text || "",
			tool_calls: calls.map(call => ({
				id: call.id,
				type: "function",
				function: {
					name: call.name,
					arguments: JSON.stringify(call.arguments || {})
				}
			}))
		};
	}

	async toolMessage(call, signal) {
		this.emitEvent(toolCallEvent(call, this.providerId));
		const result = await this.safeToolResult(call, signal);
		this.recordNextStep(result);
		this.emitEvent(toolResultEvent(call, result, this.providerId));
		return {
			role: "tool",
			tool_call_id: call.id,
			name: call.name,
			content: JSON.stringify(result)
		};
	}

	async safeToolResult(call, signal) {
		const pending = setTimeout(() => this.emitEvent(statusEvent(
			`Still running tool: ${call.name}`,
			{ message: `Still running ${call.name}…`, call },
			this.providerId
		)), TOOL_WARN_MS);
		try {
			return await withToolTimeout(
				this.bridge.call(call.name, call.arguments || {}),
				call,
				signal
			);
		} catch (error) {
			return {
				ok: false,
				action: call.name,
				timedOut: /timed out|Timeout/i.test(error?.message || error?.name || ""),
				error: error?.message || String(error),
				stack: error?.stack || "",
				localTunnel: error?.localTunnel || null
			};
		} finally {
			clearTimeout(pending);
		}
	}

	recordNextStep(result = {}) {
		const intent = result?.nextStep;
		if (!intent?.needed) return;
		this.nextStepIntent = {
			needed: true,
			prompt: intent.prompt || DEFAULT_NEXT_STEP_PROMPT,
			reason: intent.reason || "",
			source: intent.source || result.action || "awtsmoos_needs_next_step"
		};
	}

	normalizeOne(tool = {}) {
		return normalizeNativeToolCalls([tool])[0] || tool;
	}

	assertAlive(signal) {
		if (signal?.aborted) throw new DOMException("Stream stopped by user", "AbortError");
	}
}

function latestUserText(messages = []) {
	if (!Array.isArray(messages)) return "";
	for (let index = messages.length - 1; index >= 0; index -= 1) {
		if (messages[index]?.role === "user") {
			return textContent(messages[index]?.content);
		}
	}
	return "";
}

function textContent(content) {
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return String(content || "");
	return content.map(part => part?.text || part?.content || "").join("\n");
}

function schemaNames(schemas = []) {
	return schemas.map(schema => schema?.function?.name || schema?.name).filter(Boolean);
}

function preferredCouncilAction(actions = []) {
	for (const expected of ["agent", "aiAgentSpawnWebsiteMission", "websiteAgentMissionStart"]) {
		const found = actions.find(name => unqualified(name) === expected);
		if (found) return found;
	}
	return "";
}

function automaticMissionId(namespace, prompt) {
	return `webauto_${shortHash(namespace || "standalone")}_${shortHash(prompt)}`;
}

function shortHash(value) {
	let hash = 2166136261;
	for (const character of String(value || "")) {
		hash ^= character.codePointAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0).toString(36);
}

function unqualified(name = "") {
	return String(name).split(".").pop();
}

function publicMissionSummary(result = {}, websiteMissionId, action) {
	const mission = result?.mission || result?.result?.mission || null;
	return {
		ok: result?.ok === true,
		action,
		websiteMissionId: mission?.id || result?.websiteMissionId || websiteMissionId,
		missionId: mission?.missionId || result?.missionId || null,
		status: mission?.status || result?.status || (result?.ok ? "started" : "unavailable"),
		phase: mission?.phase || result?.phase || null,
		authentication: mission?.authentication || result?.authentication || null,
		agentCount: mission?.plan?.agentCount || mission?.agents?.length || null,
		nonBlocking: result?.nonBlocking !== false,
		leadContinues: true,
		reused: result?.action === "websiteAgentMissionStatus" || result?.reused === true,
		error: result?.ok === true ? null : result?.error || null
	};
}

function withCoordinationNotice(history, mission) {
	if (!mission) return history;
	const notice = mission.ok
		? `B'H COORDINATION: Website mission ${mission.websiteMissionId} is ${mission.status}; ${mission.agentCount || "multiple"} specialists are visible in Tunnel Control. Authentication is ${mission.authentication?.status || "being checked"}. Continue lead work now and do not wait idly.`
		: `B'H COORDINATION: Automatic website delegation is not currently available (${mission.error || mission.status || "unknown"}). Continue the task locally without waiting.`;
	const next = [...history];
	const systemIndex = next.findIndex(message => message?.role === "system");
	if (systemIndex >= 0) {
		next[systemIndex] = {
			...next[systemIndex],
			content: `${textContent(next[systemIndex].content)}\n\n${notice}`
		};
	} else {
		next.unshift({ role: "system", content: notice });
	}
	return next;
}

function withToolTimeout(promise, call, signal) {
	return withTimeout(
		promise,
		TOOL_TIMEOUT_MS,
		`Tool ${call.name || call.id || "tool"}`,
		signal
	);
}

function withTimeout(promise, timeoutMs, label, signal) {
	return new Promise((resolve, reject) => {
		if (signal?.aborted) {
			return reject(new DOMException("Stream stopped by user", "AbortError"));
		}
		const timer = setTimeout(() =>
			reject(new Error(`${label} timed out after ${timeoutMs / 1000}s.`)),
		timeoutMs);
		const abort = () => reject(new DOMException("Stream stopped by user", "AbortError"));
		signal?.addEventListener?.("abort", abort, { once: true });
		Promise.resolve(promise).then(resolve, reject).finally(() => {
			clearTimeout(timer);
			signal?.removeEventListener?.("abort", abort);
		});
	});
}
