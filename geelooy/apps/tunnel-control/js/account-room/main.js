// B"H
import { readRoom, writeRoom } from "./client.js";
import { displayRoom, status } from "./view.js";

/**
 * @file Every reunited shliach sees the same room after reconnect.
 * Polling reads server durability; a displayed chat is not owner authority.
 */
let updating = false;
let joined = false;
async function refresh() {
	if (updating) return;
	updating = true;
	try {
		const state = await readRoom();
		displayRoom(state);
		status(`Connected · ${state.agents.length} registered participants · ${state.messages.length} recent messages`);
	} catch (error) {
		status(`Room unavailable: ${error.message}. Sign in to Awtsmoos and retry.`);
	} finally {
		updating = false;
	}
}

async function joinRoom() {
	await writeRoom("join", {
		name: document.getElementById("agentName").value,
		operation: document.getElementById("operation").value
	});
	joined = true;
	await refresh();
}

document.getElementById("joinForm").addEventListener("submit", async event => {
	event.preventDefault();
	try { await joinRoom(); } catch (error) { status(error.message); }
});

document.getElementById("messageForm").addEventListener("submit", async event => {
	event.preventDefault();
	const textbox = document.getElementById("messageText");
	try {
		if (!joined) await joinRoom();
		await writeRoom("message", {
			message: textbox.value, kind: document.getElementById("messageKind").value,
			clientMessageId: crypto.randomUUID()
		});
		textbox.value = "";
		await refresh();
	} catch (error) { status(error.message); }
});

/** A joined browser refreshes presence without forging another participant. */
setInterval(async () => {
	if (joined) {
		try { await joinRoom(); } catch (error) { status(error.message); }
	}
	await refresh();
}, 20000);

void refresh();
