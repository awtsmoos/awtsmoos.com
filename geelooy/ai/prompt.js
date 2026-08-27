//B"H
// Boruch Hashem
// Blessed is He

import {
	EXTENSION_FILE_NAMES,
	EXTENSION_ROOT,
	EXTENSION_SOURCE_URL,
	escapeAttribute,
	promptStyle
} from "./promptAssets.js";

const EXTENSION_FILES = EXTENSION_FILE_NAMES.map(name => ({
	name,
	url: `${EXTENSION_ROOT}/${name}`
}));

/**
 * A provider key and ChatGPT transport are different vessels. The Awtsmoos gives
 * every human one clear next step, including a complete extension package whose
 * direct-chat bridge never exposes relay credentials to the page.
 */
export class AwtsmoosPrompt {
	static async go(options = {}) {
		const shared = globalThis?.AwtsmoosPrompt;
		if (shared?.go && shared !== AwtsmoosPrompt) return await shared.go(options);
		return renderPrompt(options);
	}
}

function renderPrompt(options = {}) {
	return new Promise(resolve => {
		const isAlert = Boolean(options.isAlert);
		const overlay = document.createElement("div");
		overlay.className = "awtsmoos-local-prompt-overlay";
		overlay.innerHTML = markup(options, isAlert);
		document.body.appendChild(overlay);
		const input = overlay.querySelector("input");
		input?.focus();
		const finish = value => {
			overlay.remove();
			resolve(value);
		};
		overlay.addEventListener("click", event => handleClick(event, { input, isAlert, finish }));
		overlay.addEventListener("keydown", event => {
			if (event.key === "Escape") finish(null);
			if (event.key === "Enter" && !isAlert) finish(input?.value ?? null);
		});
	});
}

async function handleClick(event, context) {
	const action = event.target?.dataset?.awtsAction;
	if (action === "download-extension") return downloadExtensionZip(event.target);
	if (action === "ok") context.finish(context.isAlert ? true : context.input?.value ?? null);
	if (action === "cancel") context.finish(null);
}

async function downloadExtensionZip(button) {
	button.disabled = true;
	button.textContent = "Building zip…";
	try {
		const zip = await import("/scripts/awtsmoos/zip/api.js");
		await zip.downloadZipFromUrls(EXTENSION_FILES, { zipName: "awtsmoos-server-extension.zip" });
		button.textContent = "Downloaded zip";
	} catch (error) {
		console.error("Extension zip failed", error);
		button.textContent = "Zip failed — see console";
	} finally {
		setTimeout(() => {
			button.disabled = false;
			button.textContent = "Download extension zip";
		}, 1800);
	}
}

function markup(options, isAlert) {
	const showExtension = shouldShowExtensionActions(options);
	const title = options.title || (showExtension
		? "B\"H — ChatGPT Transport"
		: "B\"H — AI Provider Key");
	const input = isAlert ? "" : `<input class="awtsmoos-local-prompt-input" placeholder="${escapeAttribute(options.placeholderTxt)}" value="${escapeAttribute(options.defaultValue)}" />`;
	return `<style>${promptStyle()}</style>
		<section class="awtsmoos-local-prompt-card" role="dialog" aria-modal="true">
			<h2>${escapeAttribute(title)}</h2>
			<div class="awtsmoos-local-prompt-body">${options.headerTxt || defaultHelp()}</div>
			${input}${showExtension ? extensionAside(options.extensionHelpTxt) : ""}
			<div class="awtsmoos-local-prompt-actions">${showExtension ? extensionButtons() : ""}
				<button type="button" data-awts-action="ok">${isAlert ? (options.okText || "Got it") : (options.okText || "OK")}</button>
				<button class="secondary" type="button" data-awts-action="cancel">${options.cancelText || "Close"}</button>
			</div>
		</section>`;
}

function shouldShowExtensionActions(options = {}) {
	if (options.showExtensionActions === true) return true;
	if (options.showExtensionActions === false) return false;
	const text = `${options.title || ""} ${options.headerTxt || ""} ${options.placeholderTxt || ""}`;
	if (/api\s*key|MiniMax|Gemini|OpenRouter|Groq/i.test(text)) return false;
	return Boolean(options.isAlert || /transport|extension|ChatGPT/i.test(text));
}

function extensionButtons() {
	return `<button type="button" data-awts-action="download-extension">Download extension zip</button><a href="${EXTENSION_SOURCE_URL}" target="_blank" rel="noreferrer">View extension source</a>`;
}

function extensionAside(text = "") {
	const body = text || `Download the extension zip here, view the source, or load it from <code>${EXTENSION_ROOT}</code>.`;
	return `<aside class="awtsmoos-local-prompt-extension-help">${body}</aside>`;
}

function defaultHelp() {
	return `<p>ChatGPT needs the local authenticated relay. Other providers may still use their own API keys.</p>`;
}
