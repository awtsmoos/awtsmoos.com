// B"H
import { h } from "../ui/core/html.js";
import { readRoom, writeRoom } from "../account-room/client.js";

/**
 * @file The account room as Tunnel Control's centerpiece.
 * The Awtsmoos gathers every shliach into one shared room: each tunnel deed
 * streams in live, attributed to its agent, and the owner's words here steer
 * every connected agent. This surface renders that room on the dashboard
 * (the first thing the app opens to) and as the first full pane.
 */
let started = false;
let joined = false;

export function liveRoom() {
	return h("div", { className: "panel stack awt-room-panel", id: "liveRoomPanel" }, [
		h("p", { className: "notice", id: "liveRoomStatus", text: "Connecting to the shared agent room…" }),
		h("div", { className: "awt-room-grid" }, [
			h("div", {}, [h("h3", { text: "Agents in the room" }), h("div", { id: "liveRoomRoster" })]),
			h("div", {}, [h("h3", { text: "Live actions & messages" }), h("div", { className: "awt-room-feed", id: "liveRoomFeed" })])
		]),
		h("label", {}, ["Your name in the room", h("input", { id: "liveRoomName", value: "Account owner", maxlength: "100" })]),
		h("label", {}, ["Message to all agents", h("textarea", { id: "liveRoomText", rows: "3", maxlength: "4096", placeholder: "Steer every connected agent from here…" })]),
		h("div", { className: "awt-room-actions" }, [
			h("select", { id: "liveRoomKind" }, [
				h("option", { value: "chat", text: "Conversation" }),
				h("option", { value: "proposal", text: "Proposed action" }),
				h("option", { value: "conflict", text: "Conflicting instructions" }),
				h("option", { value: "status", text: "Work status" })
			]),
			h("button", { id: "liveRoomJoin", text: "Join room" }),
			h("button", { id: "liveRoomSend", text: "Send to all agents" })
		]),
		h("p", { className: "status", text: "Every agent action on your tunnels streams in here live. Messages are shared by all agents in the room; agent identities are self-declared and messages alone do not verify owner authority." })
	]);
}

export function dashboardRoom() {
	return h("section", { className: "panel stack awt-room-home", attrs: { "aria-label": "Live agent room" } }, [
		h("h2", { text: "💬 Live agent room" }),
		h("p", { className: "notice", id: "homeRoomStatus", text: "Connecting to the shared agent room…" }),
		h("div", { className: "awt-room-feed awt-room-feed-home", id: "homeRoomFeed" }),
		h("div", { className: "awt-room-actions" }, [
			h("input", { id: "homeRoomText", maxlength: "4096", placeholder: "Message all agents — steer their work from here…" }),
			h("button", { id: "homeRoomSend", text: "Send" }),
			h("a", { attrs: { href: "./agent-room.html" }, text: "Open full room" })
		])
	]);
}

export function initLiveRoom() {
	if (started) return;
	started = true;
	bindPane();
	document.addEventListener("awt:repair-ui", bindDashboard);
	bindDashboard();
	setInterval(refresh, 3000);
	setInterval(async () => { if (joined) await join().catch(() => {}); }, 20000);
	void refresh();
}

function el(id) { return document.getElementById(id); }

async function join() {
	await writeRoom("join", {
		name: el("liveRoomName")?.value || "Account owner",
		operation: "Steering agents from Tunnel Control"
	});
	joined = true;
}

async function post(textId, kindId) {
	const box = el(textId);
	const text = (box?.value || "").trim();
	if (!text) return;
	if (!joined) await join();
	await writeRoom("message", {
		message: text,
		kind: kindId && el(kindId) ? el(kindId).value : "chat",
		clientMessageId: crypto.randomUUID()
	});
	box.value = "";
	await refresh();
}

function bindPane() {
	el("liveRoomJoin")?.addEventListener("click", async () => {
		try { await join(); await refresh(); } catch (error) { setStatus(`Join failed: ${error.message}`); }
	});
	el("liveRoomSend")?.addEventListener("click", async () => {
		try { await post("liveRoomText", "liveRoomKind"); } catch (error) { setStatus(`Send failed: ${error.message}`); }
	});
}

function bindDashboard() {
	const send = el("homeRoomSend");
	if (!send || send.dataset.bound) return;
	send.dataset.bound = "1";
	send.addEventListener("click", async () => {
		try { await post("homeRoomText", null); } catch (error) { setStatus(`Send failed: ${error.message}`); }
	});
	el("homeRoomText")?.addEventListener("keydown", event => {
		if (event.key === "Enter") { event.preventDefault(); send.click(); }
	});
}

async function refresh() {
	try {
		const state = await readRoom();
		render(state);
	} catch (error) {
		setStatus(`Room unavailable: ${error.message}`);
	}
}

function setStatus(text) {
	for (const id of ["liveRoomStatus", "homeRoomStatus"]) {
		const node = el(id);
		if (node) node.textContent = text;
	}
}

function render(state) {
	setStatus(`Live · ${state.agents.filter(a => a.online).length} agents online · ${state.messages.length} recent entries`);
	const roster = el("liveRoomRoster");
	if (roster) {
		roster.replaceChildren(...(state.agents || []).map(agent => {
			const item = document.createElement("article");
			const head = document.createElement("strong");
			head.textContent = `${agent.name} · ${agent.online ? "online" : "offline"}`;
			const sub = document.createElement("p");
			sub.className = "status";
			sub.textContent = `${agent.deviceId} — ${agent.operation}`;
			item.append(head, sub);
			return item;
		}));
		if (!state.agents?.length) roster.textContent = "Nobody has joined yet.";
	}
	for (const id of ["liveRoomFeed", "homeRoomFeed"]) {
		const feed = el(id);
		if (feed) renderFeed(feed, state.messages || []);
	}
}

function renderFeed(feed, messages) {
	const nearBottom = feed.scrollTop + feed.clientHeight >= feed.scrollHeight - 48;
	feed.replaceChildren(...messages.map(message => {
		const item = document.createElement("article");
		if (message.kind === "action") item.className = "awt-room-action";
		if (message.detail && message.detail.ok === false) item.className += " awt-room-failed";
		const head = document.createElement("strong");
		head.textContent = message.kind === "action"
			? `⚙ ${message.agentId} · action`
			: `${message.agentId} · ${message.kind}`;
		const body = document.createElement("p");
		body.textContent = message.content;
		const when = document.createElement("small");
		when.className = "status";
		when.textContent = new Date(message.at).toLocaleTimeString();
		item.append(head, body, when);
		return item;
	}));
	if (!messages.length) feed.textContent = "No messages yet.";
	if (nearBottom) feed.scrollTop = feed.scrollHeight;
}
