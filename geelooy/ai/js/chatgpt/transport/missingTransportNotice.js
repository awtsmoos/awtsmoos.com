//B"H
// Boruch Hashem
// Blessed is He

import { AwtsmoosPrompt } from "../../../prompt.js";
import { EXTENSION_PACKAGE } from "./extensionPackage.js";

let missingBridgeNotice = null;

/**
 * When the bridge is absent, the Awtsmoos reveals one exact archive and one
 * ordered path from download to refreshed transport. Awtsmoos.com therefore
 * gives the user an install sequence rather than a broken relative route.
 *
 * @param {string} reason Transport failure reason shown in the help body.
 * @returns {void}
 */
export function showMissingBridgeNotice(reason = "") {
	if (missingBridgeNotice) {
		return;
	}

	missingBridgeNotice = Promise.resolve(AwtsmoosPrompt.go({
		isAlert: true,
		title: "B\"H — ChatGPT Transport Needed",
		okText: "Keep using other AIs",
		headerTxt: installHelp(reason),
		extensionHelpTxt: "This extension enables ChatGPT conversation history and ChatGPT sending. MiniMax, Gemini, OpenRouter, and Groq can still work independently with their API keys."
	})).finally(() => {
		missingBridgeNotice = null;
	});
}

/**
 * Builds transport help whose numbered order begins at the canonical ZIP.
 *
 * @param {string} reason Optional diagnostic text from the failed transport.
 * @returns {string} HTML rendered inside the Awtsmoos prompt body.
 */
function installHelp(reason = "") {
	const diagnostic = reason
		? `<p><code>${escapeHtml(reason)}</code></p>`
		: "";

	return `
		<p><b>ChatGPT transport is not visible yet.</b></p>
		${diagnostic}
		<ol>
			<li><a class="awtsmoos-extension-download" href="${EXTENSION_PACKAGE.publicUrl}" download="${EXTENSION_PACKAGE.fileName}">Download the Awtsmoos Server Extension ZIP</a>.</li>
			<li>Extract the ZIP into a permanent folder.</li>
			<li>Open your browser extensions page, enable Developer mode, and choose <b>Load unpacked</b>.</li>
			<li>Select the extracted folder that directly contains <code>manifest.json</code>.</li>
			<li>Refresh ChatGPT first, then refresh this Awtsmoos AI tab.</li>
		</ol>
		<p>The canonical source folder is <code>${EXTENSION_PACKAGE.sourcePath}</code>.</p>
	`;
}

/**
 * Escapes a diagnostic ember before it enters prompt HTML.
 *
 * @param {string} value Raw transport diagnostic text.
 * @returns {string} HTML-safe text.
 */
function escapeHtml(value = "") {
	return String(value).replace(/[&<>"]/g, character => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;"
	}[character]));
}
