//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module Messages
 * @description Awtsmoos user-to-user messaging: inbox, threads, compose, send.
 * Uses the live /api/social/communications/:alias/* endpoints.
 */

const $ = (sel) => document.querySelector(sel);

function cleanAlias(a) {
	return String(a || "").trim().replace(/[^a-zA-Z0-9_:@.-]/g, "_").slice(0, 180);
}

async function json(url, options = {}) {
	const res = await fetch(url, options);
	const text = await res.text();
	try { return JSON.parse(text); }
	catch { return { error: { code: "BAD_JSON", text: text.slice(0, 200) } }; }
}

function ep(alias, path = "") {
	return `/api/social/communications/${encodeURIComponent(cleanAlias(alias))}${path}`;
}

function listFrom(data) {
	if (Array.isArray(data)) return data;
	if (Array.isArray(data?.success)) return data.success;
	if (Array.isArray(data?.data)) return data.data;
	return [];
}

function esc(s) {
	return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function fmtDate(ts) {
	try { return new Date(Number(ts)).toLocaleString(); }
	catch { return ""; }
}

let currentAlias = "";
let currentThread = "";

async function loadAliases() {
	const sel = $("#msg-alias-select");
	const data = await json("/api/social/aliases/details").catch(() => ({}));
	const aliases = listFrom(data).map((a) => a.id || a.aliasId || a.name).filter(Boolean);
	const stored = cleanAlias(localStorage.getItem("awtsmoosAlias") || "");
	sel.innerHTML = "";
	if (!aliases.length) {
		const o = document.createElement("option");
		o.value = stored;
		o.textContent = stored ? `@${stored}` : "No alias — create one in Profile";
		sel.append(o);
		currentAlias = stored;
		return;
	}
	for (const id of aliases) {
		const o = document.createElement("option");
		o.value = id;
		o.textContent = `@${id}`;
		sel.append(o);
	}
	sel.value = aliases.includes(stored) ? stored : aliases[0];
	currentAlias = sel.value;
	localStorage.setItem("awtsmoosAlias", currentAlias);
	sel.addEventListener("change", () => {
		currentAlias = sel.value;
		localStorage.setItem("awtsmoosAlias", currentAlias);
		loadInbox();
	});
}

async function loadInbox() {
	const status = $("#msg-status");
	const list = $("#msg-thread-list");
	status.textContent = "Loading inbox…";
	list.innerHTML = "";
	if (!currentAlias) { status.textContent = "Choose an identity to read messages."; return; }
	const data = await json(ep(currentAlias, "/inbox")).catch(() => ({}));
	if (data?.error) { status.textContent = `Inbox error: ${data.error.message || data.error.code || "unknown"}`; return; }
	const items = listFrom(data);
	// Group by thread.
	const threads = new Map();
	for (const it of items) {
		const tid = it.threadId || "general";
		if (!threads.has(tid)) threads.set(tid, []);
		threads.get(tid).push(it);
	}
	status.textContent = items.length ? `${items.length} message${items.length === 1 ? "" : "s"}` : "No messages yet.";
	for (const [tid, msgs] of threads) {
		msgs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
		const latest = msgs[0];
		const unread = msgs.filter((m) => !m.readAt).length;
		const li = document.createElement("li");
		li.className = "msg-thread-item" + (unread ? " unread" : "") + (tid === currentThread ? " active" : "");
		li.innerHTML = `<button type="button">
			<span class="msg-thread-name">${esc(latest.fromAliasId ? "@" + latest.fromAliasId : latest.title || tid)}</span>
			<span class="msg-thread-preview">${esc(String(latest.body || "").slice(0, 80))}</span>
			${unread ? `<span class="msg-unread-badge">${unread}</span>` : ""}
		</button>`;
		li.querySelector("button").addEventListener("click", () => openThread(tid));
		list.append(li);
	}
}

async function openThread(threadId) {
	currentThread = threadId;
	$("#msg-thread-title").textContent = threadId === "general" ? "General" : threadId;
	const box = $("#msg-messages");
	box.innerHTML = "<p class='msg-loading'>Loading…</p>";
	const data = await json(ep(currentAlias, `/threads/${encodeURIComponent(threadId)}`)).catch(() => ({}));
	const items = listFrom(data).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
	box.innerHTML = "";
	if (!items.length) box.innerHTML = "<p class='msg-empty'>No messages in this thread yet.</p>";
	for (const m of items) {
		const div = document.createElement("div");
		div.className = "msg-bubble" + (cleanAlias(m.fromAliasId) === cleanAlias(currentAlias) ? " mine" : "");
		div.innerHTML = `<div class="msg-from">${esc(m.fromAliasId ? "@" + m.fromAliasId : "")}</div>
			<div class="msg-text">${esc(m.body || "")}</div>
			<div class="msg-time">${esc(fmtDate(m.createdAt))}</div>`;
		box.append(div);
	}
	box.scrollTop = box.scrollHeight;
	$("#msg-composer").hidden = false;
	$("#msg-to").value = "";
	// Mark thread read.
	fetch(ep(currentAlias, `/threads/${encodeURIComponent(threadId)}/read`), { method: "POST" }).catch(() => {});
}

async function sendMessage(to, body, threadId = "") {
	const payload = {
		kind: "direct",
		title: `Message to @${to}`,
		body,
		fromAliasId: currentAlias,
		toAliasId: cleanAlias(to),
		threadId: threadId || `dm-${cleanAlias(currentAlias)}-${cleanAlias(to)}`
	};
	// Write to sender's outbox thread AND recipient's inbox.
	const mine = await json(ep(currentAlias, "/inbox"), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload)
	});
	if (mine?.error) throw new Error(mine.error.message || mine.error.code || "send failed");
	if (cleanAlias(to) !== cleanAlias(currentAlias)) {
		await json(ep(cleanAlias(to), "/inbox"), {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ...payload, title: `Message from @${currentAlias}` })
		}).catch(() => {});
	}
	return mine;
}

export async function bootMessages() {
	await loadAliases();
	await loadInbox();

	$("#msg-compose-btn").addEventListener("click", () => { $("#msg-compose-modal").hidden = false; });
	$("#msg-new-cancel").addEventListener("click", () => { $("#msg-compose-modal").hidden = true; });
	$("#msg-new-send").addEventListener("click", async () => {
		const to = $("#msg-new-to").value.trim();
		const body = $("#msg-new-body").value.trim();
		if (!to || !body) { alert("Enter a recipient and a message."); return; }
		try {
			await sendMessage(to, body);
			$("#msg-compose-modal").hidden = true;
			$("#msg-new-to").value = "";
			$("#msg-new-body").value = "";
			await loadInbox();
		} catch (e) { alert("Could not send: " + e.message); }
	});

	$("#msg-composer").addEventListener("submit", async (e) => {
		e.preventDefault();
		const to = $("#msg-to").value.trim();
		const body = $("#msg-body").value.trim();
		if (!body) return;
		try {
			await sendMessage(to || currentThread, body, currentThread);
			$("#msg-body").value = "";
			await openThread(currentThread);
			await loadInbox();
		} catch (err) { alert("Could not send: " + err.message); }
	});
}
