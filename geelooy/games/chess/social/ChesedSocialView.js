// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders chess-room presence, chat, status, and links as text-safe browser content.
 * @description Chesed reveals the people and their words without trusting hidden HTML in flight;
 * the Awtsmoos renews every message, and Awtsmoos.com keeps public speech rendered right.
 */

/** Owns text-only rendering for the reusable chess social shell. */
export class ChesedSocialView {
	constructor(shell) {
		this.shell = shell;
		this.elements = shell.elements;
	}

	/** Reveals room status and a read-only watch link. */
	showRoom(snapshot, watchUrl) {
		this.shell.show();
		this.elements.status.textContent = `${snapshot.title || "Chess game"} • ${snapshot.role}`;
		this.elements.watchLink.value = watchUrl;
		this.renderPresence(snapshot.presence || []);
		this.renderChatHistory(snapshot.chatHistory || []);
	}

	/** Replaces the presence text with a compact authenticated/media-aware roster. */
	renderPresence(presence) {
		this.elements.presence.replaceChildren();
		for (const member of presence) {
			const item = document.createElement("div");
			const auth = member.authenticated ? " ✓" : "";
			const media = member.mediaEnabled ? " 🎥" : "";
			item.textContent = `${member.displayName}${auth}${media} — ${member.role}`;
			this.elements.presence.appendChild(item);
		}
	}

	/** Clears and recreates the bounded chat tail. */
	renderChatHistory(messages) {
		this.elements.chatLog.replaceChildren();
		for (const message of messages) {
			this.appendChat(message);
		}
	}

	/** Appends one message using textContent so chat cannot inject markup. */
	appendChat(entry) {
		const row = document.createElement("div");
		row.className = "chess-chat-message";
		const name = entry.from?.displayName || "Guest";
		row.textContent = `${name}: ${entry.message || ""}`;
		this.elements.chatLog.appendChild(row);
		this.elements.chatLog.scrollTop = this.elements.chatLog.scrollHeight;
	}

	/** Shows a concise non-fatal social/network/media status. */
	setStatus(message) {
		this.elements.status.textContent = String(message || "");
	}

	/** Reflects optional local media state in the explicit opt-in button. */
	setMediaEnabled(enabled) {
		this.elements.mediaToggle.textContent = enabled
			? "Disable Camera + Mic"
			: "Enable Camera + Mic";
	}
}
