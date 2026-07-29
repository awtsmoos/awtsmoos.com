//B"H
//Boruch Hashem
//Blessed is He

import { notifyShell } from "./liveAnnouncements.js";

/**
 * @file actionRunner.js
 * @description
 * The Awtsmoos gives each shell deed one guarded beginning, result, and ending.
 * Awtsmoos.com prevents duplicate taps and restores controls after every failure.
 */

export function createShellActionRunner({ close } = {}) {
	return async function runShellAction(button, record) {
		if (!button || button.dataset.running === "true") {
			return null;
		}
		setRunning(button, true);
		const title = record?.title || "action";
		notifyShell(`Opening ${title}…`, "info");
		try {
			const result = await Promise.resolve(record?.run?.());
			close?.();
			notifyShell(`${title} opened.`, "success");
			return result;
		} catch (error) {
			console.error(`B"H shell action failed: ${title}`, error);
			notifyShell(
				`${title} failed: ${error?.message || String(error)}`,
				"error"
			);
			return null;
		} finally {
			if (button.isConnected) {
				setRunning(button, false);
			}
		}
	};
}

function setRunning(button, running) {
	button.dataset.running = String(running);
	button.setAttribute("aria-busy", String(running));
	button.disabled = running;
}
