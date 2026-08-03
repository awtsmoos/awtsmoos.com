// B"H
import { h, field, area, out, $ } from "../ui/dom.js";
import { callFs } from "../api/tunnel.js";
import { show } from "../ui/api.js";
import { rememberBeauty } from "../beauty/state.js";
import {
	currentTargetVesselName,
	rememberTargetVessel,
	VIRTUAL_OS_TUNNEL
} from "./vessels/selector.js";
import {
	forgetWebsiteMission as forgetRememberedWebsiteMission,
	rememberWebsiteMissions
} from "./websiteMissionRegistry.js";

const MODEL_MEMORY = "awtAiAgentModelChoice";
export const AI_PROVIDER_OPTIONS = Object.freeze([
	{ value: "openrouter", text: "OpenRouter" },
	{ value: "minimax", text: "MiniMax" },
	{ value: "deepseek", text: "DeepSeek" },
	{ value: "groq", text: "Groq" }
]);

let council = { agents: [], providers: [], config: {} };
let websiteMissions = [];
let websiteMissionPollTimer = 0;
let websiteMissionPollBusy = false;
let websiteMissionPaneListenerBound = false;
let websiteMissionPaneActive = false;

/** Creates the complete AI control surface, including authenticated website missions. */
export function aiAgents() {
	return h("section", {
		className: "pane awt-ai-console",
		data: { pane: "aiAgents" }
	}, [
		h("div", { className: "page-head" }, [
			h("p", { className: "eyebrow", text: "AI Agents" }),
			h("h2", { text: "Delegation council" })
		]),
		websiteMissionPanel(),
		targetPanel(),
		providerPanel(),
		configPanel(),
		taskPanel(),
		messagePanel(),
		out(
			"aiAgentsOut",
			"Refresh the council to see live keys, models, target vessel, and readiness."
		)
	]);
}

function websiteMissionPanel() {
	return h("article", {
		className: "panel stack awt-website-mission-panel"
	}, [
		h("div", { className: "page-head" }, [
			h("p", { className: "eyebrow", text: "CHATGPT WEBSITE TEAM" }),
			h("h3", { text: "Authenticated website-agent mission" }),
			h("p", {
				text: "Start several scoped agents through the saved ChatGPT website session. The lead remains non-blocking while a visible login waits."
			})
		]),
		h("div", { className: "form-grid" }, [
			field("websiteMissionProjectRoot", "Repository root", {
				placeholder: "/absolute/path/to/repository"
			}),
			field("websiteMissionAgentCount", "Website agents", {
				type: "number",
				value: "12",
				min: "3",
				max: "24"
			}),
			field("websiteMissionStartSpacing", "Start spacing (ms)", {
				type: "number",
				value: "12000",
				min: "10000"
			}),
			field("websiteMissionRounds", "Collaboration rounds", {
				type: "number",
				value: "2",
				min: "1",
				max: "8"
			})
		]),
		area(
			"websiteMissionScopes",
			"Optional scopes, one per line",
			"geelooy/apps/tunnel\ngeelooy/apps/tunnel-control"
		),
		area(
			"websiteMissionPrompt",
			"Master mission prompt",
			"Inspect first, divide the repository into non-overlapping scopes, coordinate in the shared room, implement fully, and verify every claimed result."
		),
		h("div", { className: "button-row" }, [
			button("startWebsiteMissionBtn", "Start website team", "primary"),
			button("listWebsiteMissionsBtn", "Refresh missions")
		]),
		h("div", { className: "form-grid" }, [
			field("websiteMissionId", "Website mission id", {
				placeholder: "webmission_..."
			}),
			field("websiteMissionToAgent", "Message target", { value: "all" })
		]),
		h("div", { className: "button-row" }, [
			button("statusWebsiteMissionBtn", "Refresh status"),
			button("resumeWebsiteMissionBtn", "I logged in — resume", "primary"),
			button("openWebsiteMissionRoomBtn", "Open Mission Control")
		]),
		h("div", {
			id: "websiteMissionAuth",
			className: "notice",
			text: "Authentication has not been checked yet."
		}),
		h("div", {
			id: "websiteMissionList",
			className: "awt-room-list awt-room-card-grid"
		}),
		h("div", {
			id: "websiteMissionRoster",
			className: "awt-agent-channel-grid"
		}),
		area(
			"websiteMissionMessage",
			"Shared-room message",
			"Publish your current progress, coordinate with the other agents, and finish any remaining work."
		),
		h("div", { className: "button-row" }, [
			button("messageWebsiteMissionBtn", "Send and wake agents", "primary"),
			button("stopWebsiteMissionBtn", "Stop mission", "warning"),
			button("forgetWebsiteMissionBtn", "Forget mission", "danger"),
			button("logoutChatgptWebsiteBtn", "Log out ChatGPT website", "danger")
		]),
		out("websiteMissionOut", "No website mission response yet.")
	]);
}

function targetPanel() {
	return h("article", { className: "panel stack awt-ai-target-panel" }, [
		h("h3", { text: "Target vessel for provider AI tools" }),
		h("p", {
			text: "Provider actions route to this vessel. Website-agent missions always use the selected native tunnel above."
		}),
		h("div", { className: "form-grid" }, [
			h("label", {}, [
				"Selected vessel",
				h("select", { id: "aiTargetVessel" }, [
					h("option", { value: VIRTUAL_OS_TUNNEL, text: "Hosted Virtual OS" })
				])
			]),
			h("label", {}, [
				"Current target",
				h("input", {
					id: "aiTargetVesselDisplay",
					readOnly: true,
					value: VIRTUAL_OS_TUNNEL
				})
			])
		]),
		h("p", {
			className: "notice",
			text: "Provider keys saved only to a native tunnel will not automatically exist in Hosted Virtual OS. Use the remote checkbox only when you explicitly want that copy."
		})
	]);
}

function providerPanel() {
	return h("article", { className: "panel stack awt-ai-provider-panel" }, [
		h("h3", { text: "Provider keys and live models" }),
		h("p", {
			text: "These optional provider delegates are separate from the authenticated ChatGPT website team."
		}),
		h("div", {
			id: "aiProviderStatus",
			className: "awt-provider-status",
			text: "No provider status loaded yet."
		}),
		h("div", { className: "form-grid" }, [
			h("label", {}, ["Provider", providerSelect()]),
			h("label", {}, [
				"Live model",
				h("select", { id: "aiModelSelect" }, [
					h("option", { value: "", text: "Refresh council first" })
				])
			]),
			field("aiAgentModel", "Custom model override", {
				placeholder: "optional exact model id"
			}),
			field("aiProviderKey", "API key", {
				type: "password",
				placeholder: "Paste provider API key"
			})
		]),
		remoteSaveWarning(),
		h("div", { className: "button-row" }, [
			button("saveAiProviderKeyBtn", "Save provider key", "primary"),
			button("removeAiProviderKeyBtn", "Remove key"),
			button("loadAiAgentsBtn", "Refresh council")
		])
	]);
}

function remoteSaveWarning() {
	return h("label", { className: "notice danger" }, [
		h("input", { id: "saveProviderKeyToAccount", type: "checkbox" }),
		" Also save this provider API key to my Awtsmoos account for hosted Virtual OS. This stores the key remotely, not only on this device."
	]);
}

function configPanel() {
	return h("article", { className: "panel stack awt-ai-config-panel" }, [
		h("h3", { text: "Recursive provider-task limits" }),
		h("p", {
			text: "These limits apply to provider-backed generic tasks, not the website mission roster above."
		}),
		h("div", { className: "form-grid" }, [
			field("aiMaxDepth", "Max recursive depth", {
				type: "number", value: "3", min: "0"
			}),
			field("aiMaxChildren", "Max children per task", {
				type: "number", value: "8", min: "0"
			}),
			field("aiMaxTotalTasks", "Max total task records", {
				type: "number", value: "80", min: "1"
			}),
			h("label", {}, [
				"Allow recursive spawn",
				h("select", { id: "aiAllowRecursive" }, [
					h("option", { value: "true", text: "Yes" }),
					h("option", { value: "false", text: "No" })
				])
			])
		]),
		button("saveAiConfigBtn", "Save spawn limits", "primary")
	]);
}

function taskPanel() {
	return h("article", { className: "panel stack awt-ai-task-panel" }, [
		h("h3", { text: "Generic provider task" }),
		h("div", { className: "form-grid" }, [
			field("aiTaskTitle", "Task title", { value: "Research and build plan" }),
			field("aiTaskOutputDir", "Output directory", {
				placeholder: "AI_THOUGHTS/agent-tasks/run-name"
			}),
			field("aiTaskFileName", "Output file", { placeholder: "result.md" }),
			area(
				"aiTaskPrompt",
				"Prompt",
				"Break this project into child tasks. Append awtsmoos_agent_tasks JSON for useful delegates."
			)
		]),
		h("div", { className: "button-row" }, [
			button("spawnAiTaskBtn", "Spawn generic task", "primary"),
			button("listAiTasksBtn", "List tasks")
		]),
		h("div", { className: "form-grid" }, [
			field("aiTaskId", "Task id", { placeholder: "task id from spawn/list" })
		]),
		h("div", { className: "button-row" }, [
			button("aiTaskStatusBtn", "Check status"),
			button("aiTaskResultBtn", "Get result")
		])
	]);
}

function messagePanel() {
	return h("article", { className: "panel stack awt-ai-message-panel" }, [
		h("h3", { text: "Direct provider delegate message" }),
		h("div", { className: "form-grid" }, [
			field("aiAgentId", "Agent id", { value: "minimax-deep" }),
			area("aiAgentSystem", "System override", ""),
			area("aiAgentMessage", "Message", "Brainstorm three implementation risks and fixes.")
		]),
		button("sendAiAgentBtn", "Send message", "primary")
	]);
}

function providerSelect() {
	return h("select", { id: "aiProviderId" }, AI_PROVIDER_OPTIONS.map(option =>
		h("option", { value: option.value, text: option.text })
	));
}

function button(id, text, className = "") {
	return h("button", { id, className, text, type: "button" });
}

/** Mounts provider and authenticated website mission controls. */
export function mountAiAgents(getTunnelName) {
	if (!$("loadAiAgentsBtn")) return;
	restoreChoice();
	hydrateTarget(getTunnelName);
	bindProviderControls(getTunnelName);
	bindWebsiteMissionControls(getTunnelName);
	websiteMissions = [];
	renderWebsiteMissionList();
	refreshCouncil(getTunnelName, "Council loaded after refresh.")
		.catch(error => show("aiAgentsOut", { ok: false, error: String(error) }));
	refreshWebsiteMissions(getTunnelName, true).catch(error =>
		showWebsiteError(error)
	);
	bindWebsiteMissionPolling(getTunnelName);
}

function bindProviderControls(getTunnelName) {
	$("aiTargetVessel").onchange = () =>
		hydrateTarget(getTunnelName, $("aiTargetVessel").value);
	$("aiProviderId").onchange = () => { saveChoice(); renderModels(); };
	$("aiModelSelect").onchange = saveChoice;
	$("loadAiAgentsBtn").onclick = () =>
		refreshCouncil(getTunnelName, "Council refreshed.");
	$("saveAiConfigBtn").onclick = () => run(getTunnelName, {
		action: "aiAgentConfigSet",
		maxDepth: $("aiMaxDepth").value,
		maxChildrenPerTask: $("aiMaxChildren").value,
		maxTotalTasks: $("aiMaxTotalTasks").value,
		allowRecursiveSpawn: $("aiAllowRecursive").value
	});
	$("saveAiProviderKeyBtn").onclick = () => saveProviderKey(getTunnelName);
	$("removeAiProviderKeyBtn").onclick = async () => {
		await run(getTunnelName, {
			action: "aiAgentRemoveProviderKey",
			provider: $("aiProviderId").value
		});
		await refreshCouncil(
			getTunnelName,
			"Provider key removed from the selected vessel. Remove again with Hosted Virtual OS selected if a remote copy exists."
		);
	};
	$("sendAiAgentBtn").onclick = () =>
		run(getTunnelName, messagePayload("aiAgentMessage"));
	$("spawnAiTaskBtn").onclick = () => run(getTunnelName, taskPayload());
	$("listAiTasksBtn").onclick = () =>
		run(getTunnelName, { action: "aiAgentTaskList", limit: 25 });
	$("aiTaskStatusBtn").onclick = () => run(getTunnelName, {
		action: "aiAgentTaskStatus",
		taskId: $("aiTaskId").value
	});
	$("aiTaskResultBtn").onclick = () => run(getTunnelName, {
		action: "aiAgentTaskResult",
		taskId: $("aiTaskId").value
	});
}

function bindWebsiteMissionControls(getTunnelName) {
	bindWebsiteButton("startWebsiteMissionBtn", () =>
		startWebsiteMission(getTunnelName));
	bindWebsiteButton("listWebsiteMissionsBtn", () =>
		refreshWebsiteMissions(getTunnelName));
	bindWebsiteButton("statusWebsiteMissionBtn", () =>
		refreshWebsiteMissionStatus(getTunnelName, false));
	bindWebsiteButton("resumeWebsiteMissionBtn", () =>
		refreshWebsiteMissionStatus(getTunnelName, true));
	bindWebsiteButton("messageWebsiteMissionBtn", () =>
		messageWebsiteMission(getTunnelName));
	bindWebsiteButton("stopWebsiteMissionBtn", () =>
		stopWebsiteMission(getTunnelName));
	bindWebsiteButton("forgetWebsiteMissionBtn", () =>
		forgetWebsiteMission(getTunnelName));
	bindWebsiteButton("logoutChatgptWebsiteBtn", () =>
		logoutWebsiteSession(getTunnelName));
	$("openWebsiteMissionRoomBtn").onclick = openWebsiteMissionRoom;
	$("websiteMissionId").onchange = () => {
		const cached = websiteMissions.find(record =>
			(record.id || record.websiteMissionId) === $("websiteMissionId").value
		);
		if (cached) renderWebsiteMissionSummary(cached);
	};
}

function bindWebsiteMissionPolling(getTunnelName) {
	if (!websiteMissionPaneListenerBound) {
		websiteMissionPaneListenerBound = true;
		document.addEventListener("awt:pane-change", event => {
			websiteMissionPaneActive = event.detail?.pane === "aiAgents";
			if (websiteMissionPaneActive) {
				scheduleWebsiteMissionPoll(getTunnelName, 250);
			} else {
				clearTimeout(websiteMissionPollTimer);
				websiteMissionPollTimer = 0;
			}
		});
	}
	const pane = $("websiteMissionRoster")?.closest?.("[data-pane='aiAgents']");
	websiteMissionPaneActive = Boolean(pane?.classList?.contains("active"));
	if (websiteMissionPaneActive) {
		scheduleWebsiteMissionPoll(getTunnelName, 2500);
	}
}

function scheduleWebsiteMissionPoll(getTunnelName, delayMs = 3000) {
	if (!websiteMissionPaneActive) return;
	clearTimeout(websiteMissionPollTimer);
	websiteMissionPollTimer = setTimeout(async () => {
		if (websiteMissionPollBusy) {
			return scheduleWebsiteMissionPoll(getTunnelName, 1000);
		}
		websiteMissionPollBusy = true;
		try {
			if (selectedWebsiteMissionId()) {
				await refreshWebsiteMissionStatus(getTunnelName, false, true);
			} else {
				await refreshWebsiteMissions(getTunnelName, true);
			}
		} catch (error) {
			showWebsiteError(error);
		} finally {
			websiteMissionPollBusy = false;
			if (websiteMissionPaneActive) {
				scheduleWebsiteMissionPoll(getTunnelName, 3000);
			}
		}
	}, Math.max(250, Number(delayMs) || 3000));
}

function bindWebsiteButton(id, handler) {
	const node = $(id);
	if (!node) return;
	node.onclick = () => Promise.resolve(handler()).catch(showWebsiteError);
}

export function resolveAiTarget(getTunnelName) {
	return currentTargetVesselName(
		$("aiTargetVessel")?.value || getTunnelName?.() || VIRTUAL_OS_TUNNEL
	);
}

function hydrateTarget(getTunnelName, explicit = "") {
	const target = rememberTargetVessel(
		explicit || currentTargetVesselName(getTunnelName?.() || VIRTUAL_OS_TUNNEL)
	);
	if ($("aiTargetVessel")) {
		const exists = Array.from($("aiTargetVessel").children || [])
			.some(option => option.value === target);
		if (!exists) {
			$("aiTargetVessel").append(h("option", { value: target, text: target }));
		}
		$("aiTargetVessel").value = target;
	}
	if ($("aiTargetVesselDisplay")) $("aiTargetVesselDisplay").value = target;
	return target;
}

async function saveProviderKey(getTunnelName) {
	const saveToAccount = Boolean($("saveProviderKeyToAccount")?.checked);
	const got = await run(getTunnelName, {
		action: "aiAgentSetProviderKey",
		provider: $("aiProviderId").value,
		apiKey: $("aiProviderKey").value,
		saveProviderKeyToAccount: saveToAccount,
		saveToAccount
	});
	$("aiProviderKey").value = "";
	$("saveProviderKeyToAccount").checked = false;
	const message = saveToAccount
		? "Provider key saved to selected vessel and copied to Awtsmoos account for Virtual OS."
		: "Provider key saved to selected vessel only; Virtual OS will not receive it.";
	await refreshCouncil(getTunnelName, message);
	return got;
}

async function refreshCouncil(getTunnelName, message) {
	const got = await callFs(resolveAiTarget(getTunnelName), { action: "aiAgentList" });
	council = {
		agents: got.agents || [],
		providers: got.providers || [],
		config: got.config || {}
	};
	applyConfig(council.config);
	renderProviderStatus();
	renderModels();
	show("aiAgentsOut", {
		...got,
		uiMessage: `${message} Target: ${resolveAiTarget(getTunnelName)}`
	});
}

async function startWebsiteMission(getTunnelName) {
	const payload = websiteMissionStartPayload({
		prompt: $("websiteMissionPrompt").value,
		projectRoot: $("websiteMissionProjectRoot").value,
		agentCount: $("websiteMissionAgentCount").value,
		scopes: $("websiteMissionScopes").value,
		startSpacingMs: $("websiteMissionStartSpacing").value,
		collaborationRounds: $("websiteMissionRounds").value
	});
	const got = await callWebsite(getTunnelName, payload);
	if (got?.ok !== false && got?.mission?.id) {
		$("websiteMissionId").value = got.mission.id;
	}
	acceptWebsiteResponse(got);
	return got;
}

async function refreshWebsiteMissions(getTunnelName, quiet = false) {
	const got = await callWebsite(getTunnelName, {
		action: "websiteAgentMissionList",
		limit: 100
	}, quiet);
	acceptWebsiteResponse(got, { preserveCurrent: true });
	return got;
}

async function refreshWebsiteMissionStatus(
	getTunnelName,
	refreshAuthentication,
	quiet = false
) {
	const got = await callWebsite(
		getTunnelName,
		websiteMissionStatusPayload(requireWebsiteMissionId(), refreshAuthentication),
		quiet
	);
	acceptWebsiteResponse(got);
	return got;
}

async function messageWebsiteMission(getTunnelName) {
	const got = await callWebsite(getTunnelName, websiteMissionMessagePayload({
		websiteMissionId: requireWebsiteMissionId(),
		toAgent: $("websiteMissionToAgent").value,
		body: $("websiteMissionMessage").value
	}));
	if (got?.ok !== false) $("websiteMissionMessage").value = "";
	acceptWebsiteResponse(got, { preserveCurrent: true });
	await refreshWebsiteMissionStatus(getTunnelName, false);
	return got;
}

async function stopWebsiteMission(getTunnelName) {
	if (!confirmAction("Stop this website-agent mission after its active turn?")) return null;
	const got = await callWebsite(getTunnelName, {
		action: "websiteAgentMissionStop",
		websiteMissionId: requireWebsiteMissionId()
	});
	acceptWebsiteResponse(got);
	return got;
}

async function forgetWebsiteMission(getTunnelName) {
	const id = requireWebsiteMissionId();
	if (!confirmAction("Delete this mission record and its private continuation mappings?")) {
		return null;
	}
	const got = await callWebsite(getTunnelName, {
		action: "websiteAgentMissionForget",
		websiteMissionId: id
	});
	if (got?.ok !== false) {
		forgetRememberedWebsiteMission(id);
		websiteMissions = websiteMissions.filter(record => record.id !== id);
		$("websiteMissionId").value = "";
		renderWebsiteMissionList();
		renderWebsiteMissionSummary(null);
	}
	return got;
}

async function logoutWebsiteSession(getTunnelName) {
	if (!confirmAction("Log out the dedicated ChatGPT website session on this tunnel?")) {
		return null;
	}
	const got = await callWebsite(getTunnelName, { action: "chatgptWebsiteLogout" });
	if (got?.ok !== false) {
		setAuthenticationNotice({ status: "logged_out", loginOpened: false });
	}
	return got;
}

async function callWebsite(getTunnelName, payload, quiet = false) {
	const tunnelName = getTunnelName?.() || "auto";
	if (!quiet && $("websiteMissionOut")) {
		$("websiteMissionOut").textContent = `Calling ${payload.action} on ${tunnelName}...`;
	}
	const got = await callFs(tunnelName, {
		...payload,
		targetVessel: "native-tunnel"
	});
	if (!quiet || got?.ok === false) show("websiteMissionOut", got);
	if (got?.ok === false) {
		throw new Error(got.message || got.error || `${payload.action}_failed`);
	}
	return got;
}

function acceptWebsiteResponse(got, options = {}) {
	if (!got || got.ok === false) return;
	rememberWebsiteMissions(
		Array.isArray(got.missions) ? got.missions : got.mission ? [got.mission] : []
	);
	if (Array.isArray(got.missions)) {
		websiteMissions = got.missions;
		const selected = preferredWebsiteMission(
			websiteMissions,
			selectedWebsiteMissionId()
		);
		if (selected) {
			$("websiteMissionId").value = selected.id || selected.websiteMissionId || "";
			renderWebsiteMissionSummary(selected);
		}
	}
	if (got.mission) {
		const index = websiteMissions.findIndex(record => record.id === got.mission.id);
		if (index >= 0) websiteMissions[index] = got.mission;
		else websiteMissions.unshift(got.mission);
		if (!options.preserveCurrent || !selectedWebsiteMissionId()) {
			$("websiteMissionId").value = got.mission.id;
		}
		renderWebsiteMissionSummary(got.mission);
	}
	renderWebsiteMissionList();
}

function renderWebsiteMissionList() {
	const root = $("websiteMissionList");
	if (!root) return;
	const records = websiteMissions;
	if (!records.length) {
		root.replaceChildren(h("p", {
			className: "empty-state",
			text: "No website-agent missions found on this tunnel yet."
		}));
		return;
	}
	root.replaceChildren(...records.map(record => h("button", {
		className: `awt-room-card ${(record.id || record.websiteMissionId) === selectedWebsiteMissionId() ? "is-active" : ""}`,
		type: "button",
		data: { websiteMissionId: record.id || record.websiteMissionId || "" },
		on: { click: () => selectWebsiteMission(record) }
	}, [
		h("strong", { text: record.goal || record.id || "Website mission" }),
		h("small", { text: record.id || record.websiteMissionId || "unknown id" }),
		h("div", { className: "awt-room-card-metrics" }, [
			chip(record.status || "unknown"),
			chip(`${record.agents?.length || record.agentCount || 0} agents`),
			chip(record.authentication?.status || record.authenticationStatus || "auth unchecked")
		])
	])));
}

function selectWebsiteMission(record) {
	const id = record.id || record.websiteMissionId || "";
	$("websiteMissionId").value = id;
	renderWebsiteMissionSummary(record);
	renderWebsiteMissionList();
}

function renderWebsiteMissionSummary(record) {
	if (!record) {
		setAuthenticationNotice({ status: "unchecked" });
		renderWebsiteRoster([]);
		return;
	}
	setAuthenticationNotice(record.authentication || {
		status: record.authenticationStatus || "unchecked"
	});
	renderWebsiteRoster(record.agents || []);
}

function setAuthenticationNotice(authentication = {}) {
	const root = $("websiteMissionAuth");
	if (!root) return;
	const status = String(authentication.status || "unchecked");
	root.className = `notice ${status === "authenticated" ? "success" : "danger"}`;
	root.textContent = status === "authenticated"
		? "ChatGPT website session authenticated. Agents may use their saved conversations."
		: status === "logged_out"
			? "ChatGPT website session logged out. The next mission turn will open normal login."
			: `ChatGPT website authentication: ${status}. ${authentication.loginOpened ? "The visible login window was opened." : "Resume checks the saved session and opens one visible login when needed."}`;
}

function renderWebsiteRoster(agents = []) {
	const root = $("websiteMissionRoster");
	if (!root) return;
	if (!agents.length) {
		root.replaceChildren(h("p", {
			className: "empty-state",
			text: "Select or start a mission to see its website agents."
		}));
		return;
	}
	root.replaceChildren(...agents.map(agent => h("article", {
		className: `panel awt-agent-channel is-${agent.status || "unknown"}`,
		data: { websiteAgentId: agent.id || "" }
	}, [
		h("strong", { text: agent.name || agent.id || "website agent" }),
		h("small", { text: `${agent.role || "agent"} · ${agent.scope || "."}` }),
		h("div", { className: "awt-room-card-metrics" }, [
			chip(agent.status || "queued"),
			chip(`round ${agent.round || 0}`),
			chip(`${agent.pendingRoomMessages || 0} messages`)
		]),
		agent.lastUpdate ? h("p", { text: agent.lastUpdate }) : null,
		agent.error ? h("p", { className: "notice danger", text: agent.error }) : null
	])));
}

function openWebsiteMissionRoom() {
	const id = requireWebsiteMissionId();
	const record = websiteMissions.find(item =>
		(item.id || item.websiteMissionId) === id
	);
	const missionId = record?.missionId;
	if (!missionId) return showWebsiteError(new Error("mission_room_id_unavailable"));
	rememberMissionRoomSelection(record);
	rememberBeauty("lastPane", "missionRooms");
	const url = new URL(globalThis.location.href);
	url.searchParams.set("room", missionId);
	url.searchParams.set("websiteMissionId", id);
	if (typeof globalThis.location.assign === "function") {
		globalThis.location.assign(url.toString());
	} else {
		globalThis.location.href = url.toString();
	}
}

function selectedWebsiteMissionId() {
	return String($("websiteMissionId")?.value || "").trim();
}

function requireWebsiteMissionId() {
	const id = selectedWebsiteMissionId();
	if (!id) throw new Error("website_mission_id_required");
	return id;
}

function chip(text) {
	return h("span", { className: "awt-room-chip", text: String(text) });
}

function confirmAction(message) {
	return typeof globalThis.confirm !== "function" || globalThis.confirm(message);
}

function showWebsiteError(error) {
	show("websiteMissionOut", {
		ok: false,
		error: error?.message || String(error)
	});
}

function rememberMissionRoomSelection(record = {}) {
	try {
		localStorage.setItem("awt.missionRooms.selection", JSON.stringify({
			missionId: record.missionId || "",
			projectRoot: record.plan?.projectRoot || "",
			agentId: "control-room-human",
			savedAt: new Date().toISOString()
		}));
	} catch {
		// The room remains query-addressable when browser persistence is denied.
	}
}

/** Pure payload contract used by the UI and focused tests. */
export function websiteMissionStartPayload(input = {}) {
	return {
		action: "agent",
		mode: "website-mission",
		prompt: String(input.prompt || "").trim(),
		projectRoot: String(input.projectRoot || "").trim(),
		agentCount: boundedNumber(input.agentCount, 12, 3, 24),
		scopes: splitLines(input.scopes),
		startSpacingMs: boundedNumber(input.startSpacingMs, 12000, 10000, 60000),
		collaborationRounds: boundedNumber(input.collaborationRounds, 2, 1, 8)
	};
}

/** Pure status payload contract with an explicit late-login refresh switch. */
export function websiteMissionStatusPayload(websiteMissionId, refreshAuthentication = false) {
	return {
		action: "websiteAgentMissionStatus",
		websiteMissionId: String(websiteMissionId || "").trim(),
		refreshAuthentication: Boolean(refreshAuthentication)
	};
}

/** Pure room-message payload that wakes idle and completed website agents. */
export function websiteMissionMessagePayload(input = {}) {
	return {
		action: "websiteAgentMissionMessage",
		websiteMissionId: String(input.websiteMissionId || "").trim(),
		toAgent: String(input.toAgent || "all").trim() || "all",
		body: String(input.body || "").trim()
	};
}

/** Keeps a selected mission when present and otherwise reveals the newest roster. */
export function preferredWebsiteMission(records = [], selectedId = "") {
	const missions = Array.isArray(records) ? records : [];
	const id = String(selectedId || "").trim();
	return missions.find(record =>
		String(record?.id || record?.websiteMissionId || "") === id
	) || missions[0] || null;
}

function boundedNumber(value, fallback, minimum, maximum) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, Math.floor(number)))
		: fallback;
}

function splitLines(value) {
	if (Array.isArray(value)) return value.map(String).map(item => item.trim()).filter(Boolean);
	return String(value || "").split(/\r?\n|,/).map(item => item.trim()).filter(Boolean);
}

function applyConfig(config) {
	if (!config) return;
	if ($("aiMaxDepth")) $("aiMaxDepth").value = config.maxDepth ?? $("aiMaxDepth").value;
	if ($("aiMaxChildren")) {
		$("aiMaxChildren").value = config.maxChildrenPerTask ?? $("aiMaxChildren").value;
	}
	if ($("aiMaxTotalTasks")) {
		$("aiMaxTotalTasks").value = config.maxTotalTasks ?? $("aiMaxTotalTasks").value;
	}
	if ($("aiAllowRecursive")) {
		$("aiAllowRecursive").value = String(config.allowRecursiveSpawn !== false);
	}
}

function renderProviderStatus() {
	const box = $("aiProviderStatus");
	if (!box) return;
	box.replaceChildren(...council.providers.map(provider => h("div", {
		className: "notice awt-provider-chip"
	}, [
		h("b", { text: provider.name || provider.id }),
		" — ",
		provider.hasKey ? `saved ${provider.keyMask || "masked"}` : "no key",
		h("br"),
		h("span", {
			text: `default ${provider.defaultModel || "unknown"} · ${provider.keySource || "account/session"}`
		})
	])));
}

function renderModels() {
	const select = $("aiModelSelect");
	if (!select) return;
	const provider = $("aiProviderId")?.value || "minimax";
	const models = modelOptions(provider);
	select.replaceChildren(...models.map(model =>
		h("option", { value: model, text: model })
	));
	const saved = readChoice();
	const next = models.includes(saved.model) ? saved.model : models[0] || "";
	select.value = next;
	if (!$("aiAgentModel").value) {
		$("aiAgentModel").placeholder = next || "optional exact model id";
	}
	chooseAgentForProvider(provider, next);
	saveChoice();
}

function modelOptions(provider) {
	const live = council.agents
		.filter(agent => agent.provider === provider)
		.map(agent => agent.model)
		.filter(Boolean);
	const defaults = council.providers
		.filter(item => item.id === provider)
		.map(item => item.defaultModel)
		.filter(Boolean);
	return [...new Set([...live, ...defaults])];
}

function chooseAgentForProvider(provider, model) {
	const agent = council.agents.find(item =>
		item.provider === provider && item.model === model
	) || council.agents.find(item => item.provider === provider);
	if (agent && $("aiAgentId")) $("aiAgentId").value = agent.id;
}

function messagePayload(action) {
	const model = $("aiAgentModel").value || $("aiModelSelect")?.value || "";
	return {
		action,
		targetVessel: resolveAiTarget(),
		agentId: $("aiAgentId").value,
		provider: $("aiProviderId").value,
		model,
		system: $("aiAgentSystem").value,
		message: $("aiAgentMessage").value,
		stream: true
	};
}

function taskPayload() {
	return {
		...messagePayload("aiAgentSpawnTask"),
		kind: "genericTask",
		title: $("aiTaskTitle").value,
		prompt: $("aiTaskPrompt").value,
		outputDir: $("aiTaskOutputDir").value,
		fileName: $("aiTaskFileName").value,
		maxDepth: $("aiMaxDepth").value,
		maxChildrenPerTask: $("aiMaxChildren").value,
		maxTotalTasks: $("aiMaxTotalTasks").value,
		allowRecursiveSpawn: $("aiAllowRecursive").value
	};
}

async function run(getTunnelName, opts) {
	$("aiAgentsOut").textContent = `Calling ${opts.action} on ${resolveAiTarget(getTunnelName)}...`;
	const got = await callFs(resolveAiTarget(getTunnelName), {
		...opts,
		targetVessel: resolveAiTarget(getTunnelName)
	});
	show("aiAgentsOut", got);
	return got;
}

function readChoice() {
	try {
		return JSON.parse(localStorage.getItem(MODEL_MEMORY) || "{}");
	} catch {
		return {};
	}
}

function saveChoice() {
	localStorage.setItem(MODEL_MEMORY, JSON.stringify({
		provider: $("aiProviderId")?.value || "minimax",
		model: $("aiModelSelect")?.value || ""
	}));
}

function restoreChoice() {
	const saved = readChoice();
	if (saved.provider && $("aiProviderId")) $("aiProviderId").value = saved.provider;
}
