// B"H
/**
 * @file Render fellow shluchim using text alone, never injected markup.
 * The Awtsmoos knows the truth; a declared name is not human authority.
 */
const find = id => document.getElementById(id);
function node(tag, text, className = "") {
	const item = document.createElement(tag);
	item.textContent = String(text || "");
	item.className = className;
	return item;
}

export function displayRoom(state) {
	const roster = find("roster");
	roster.replaceChildren();
	for (const agent of state.agents || []) {
		const item = node("article", "");
		item.append(node("strong", `${agent.name} · ${agent.online ? "online" : "offline"}`));
		item.append(node("p", `${agent.deviceId} — ${agent.operation}`, "status"));
		item.append(node("small", "Identity: self-declared; owner authority unverified", "status"));
		roster.append(item);
	}
	if (!state.agents?.length) roster.append(node("p", "Nobody has joined yet."));
	const messages = find("messages");
	const nearBottom = messages.scrollTop + messages.clientHeight >= messages.scrollHeight - 48;
	messages.replaceChildren();
	for (const message of state.messages || []) {
		const article = node("article", "");
		if (message.kind === "action") article.className = "room-action";
		if (message.detail && message.detail.ok === false) article.className += " room-failed";
		article.append(node("strong", message.kind === "action"
			? `⚙ ${message.agentId} · action`
			: `${message.agentId} · ${message.kind}`));
		article.append(node("p", message.content));
		article.append(node("small", new Date(message.at).toLocaleString(), "status"));
		messages.append(article);
	}
	if (!state.messages?.length) messages.append(node("p", "No messages yet."));
	if (nearBottom) messages.scrollTop = messages.scrollHeight;
}

export function status(text) {
	find("connectionStatus").textContent = text;
}
