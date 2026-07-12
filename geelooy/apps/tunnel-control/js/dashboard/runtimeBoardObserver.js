// B"H

export function connectRuntimeBoard(board) {
	if (!board || board.dataset.connected === "true") return;
	board.dataset.connected = "true";
	if (typeof document.getElementById !== "function") return;
	refresh();
	if (typeof MutationObserver !== "function") return;
	let queued = false;
	const schedule = () => {
		if (queued) return;
		queued = true;
		const run = () => { queued = false; refresh(); };
		if (typeof requestAnimationFrame === "function") requestAnimationFrame(run);
		else setTimeout(run, 0);
	};
	const observer = new MutationObserver(schedule);
	for (const selector of ["[data-pane='missionRooms']", "[data-pane='live']"]) {
		const root = document.querySelector?.(selector);
		if (root) observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true });
	}
}

function refresh() {
	refreshRooms();
	refreshLive();
}

function refreshRooms() {
	const cards = [...(document.querySelectorAll?.(".awt-room-card") || [])];
	setText("awtDeckRoomCount", String(cards.length));
	setText("awtDeckRoomNeeds", String(cards.filter(card => card.classList.contains("is-needs-human")).length));
	const agents = document.querySelectorAll?.("#roomMembers .awt-room-member")?.length || 0;
	setText("awtDeckRoomAgents", agents ? String(agents) : "—");
	setText("awtDeckRoomStream", textOf("roomSocketState", "Lobby"));
	setText("awtDeckSelectedRoom", textOf("roomHeader", "No room selected yet."));
	const state = cards.some(card => card.classList.contains("is-needs-human")) ? "is-warning" : cards.length ? "is-live" : "is-idle";
	setCardState("awtDeckRoomsCard", state);
}

function refreshLive() {
	const mode = textOf("liveKpi_mode", "idle");
	const status = textOf("liveSocketState", "Waiting for live pane");
	setText("awtDeckLiveMode", mode);
	setText("awtDeckLiveTotal", textOf("liveKpi_total", "—"));
	setText("awtDeckLiveFailed", textOf("liveKpi_failed", "—"));
	setText("awtDeckLiveStatus", status);
	const state = /websocket|eventsource|polling/i.test(mode) ? "is-live" : /error|failed/i.test(status) ? "is-warning" : "is-idle";
	setCardState("awtDeckLiveCard", state);
}

function textOf(id, fallback) {
	return document.getElementById(id)?.textContent?.trim() || fallback;
}

function setText(id, text) {
	const node = document.getElementById(id);
	if (node) node.textContent = text;
}

function setCardState(id, stateClass) {
	const card = document.getElementById(id);
	if (!card) return;
	card.classList.remove("is-live", "is-warning", "is-idle");
	card.classList.add(stateClass);
}
