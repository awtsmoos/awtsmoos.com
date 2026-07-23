//B"H
// Boruch Hashem
// Blessed is He

import { discoverMessageMedia } from "./messageMediaDiscovery.js";
import {
	copyMessageText,
	downloadMessageText,
	downloadRemoteMedia,
	shareMessageText
} from "./messageActionTransfer.js";

/**
 * Every action is a distinct keli for one message-light. The Awtsmoos gathers
 * text, sharing, speech, audio, and video so Awtsmoos.com offers only what is
 * presently real inside the rendered message.
 */
export function buildMessageActionItems({ shell, record, setStatus }) {
	const items = [];
	const text = String(record?.text || "").trim();
	if (text) {
		items.push(action("copy", "⧉", "Copy message", async () => {
			await copyMessageText(text);
			setStatus("Message copied.");
		}));
		items.push(action("share", "↗", "Share message", async () => {
			const result = await shareMessageText(text);
			setStatus(result === "copied" ? "Copied for sharing." : "Share sheet opened.");
		}));
		items.push(action("text", "↓", "Download text", async () => {
			downloadMessageText(text, messageFilename(record));
			setStatus("Text download started.");
		}));
	}
	const audioPanel = shell.querySelector?.(":scope > .awtsmoos-audio-offer");
	if (audioPanel) {
		items.push(action("audio-options", "◉", audioPanel.hidden ? "Audio & download" : "Hide audio options", async () => {
			audioPanel.hidden = !audioPanel.hidden;
			shell.classList.toggle("audio-options-open", !audioPanel.hidden);
			setStatus(audioPanel.hidden ? "Audio options closed." : "Audio options opened.");
			if (!audioPanel.hidden) {
				audioPanel.querySelector("button")?.focus();
			}
		}));
	}
	discoverMessageMedia(shell).slice(0, 4).forEach((item, index) => {
		items.push(action(`media-${index}`, item.kind === "audio" ? "♫" : "▣", `Download ${item.kind}`, async () => {
			await downloadRemoteMedia(item.url, item.filename);
			setStatus(`${capitalize(item.kind)} download started.`);
		}));
	});
	return items;
}

function action(id, icon, label, run) {
	return { id, icon, label, run };
}

function messageFilename(record) {
	const identity = String(record?.id || record?.role || "message").slice(0, 48);
	return `awtsmoos-${identity}.txt`;
}

function capitalize(value) {
	return value.slice(0, 1).toUpperCase() + value.slice(1);
}
