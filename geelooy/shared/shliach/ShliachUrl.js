//B"H
//Boruch Hashem
//Blessed be He

import { buildShliachPrompt } from "./ShliachPrompt.js";

/**
 * @module ShliachUrl
 * @description
 * The Awtsmoos gives one canonical doorway into the public Awtsmoos Shliach GPT;
 * Awtsmoos.com encodes only the bounded human-visible prompt, never account secrets.
 */

export const AWTSMOOS_SHLIACH_URL = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";

/**
 * Builds the external ChatGPT URL with the current prompt-prefill query convention.
 * @param {object} context Safe Shliach creation context.
 * @returns {{url:string,prompt:string}} Encoded URL and exact fallback prompt text.
 */
export function buildShliachUrl(context = {}) {
	const prompt = buildShliachPrompt(context);
	const url = new URL(AWTSMOOS_SHLIACH_URL);
	url.searchParams.set("prompt", prompt);
	return {
		url: url.toString(),
		prompt
	};
}

/**
 * Opens Shliach immediately from a user gesture and copies the same prompt as fallback.
 * @param {object} context Safe Shliach creation context.
 * @returns {{url:string,prompt:string,opened:boolean,copyPromise:Promise<boolean>}} Launch testimony.
 */
export function openShliach(context = {}) {
	const target = buildShliachUrl(context);
	const openedInOs = openInGeelooyBrowser(target, context);
	const copyPromise = copyPrompt(target.prompt);
	if (!openedInOs) {
		window.location.assign(target.url);
	}
	return {
		...target,
		opened: true,
		openedInOs,
		copyPromise
	};
}

/** Opens the real remote Browser program when the current surface lives inside Geelooy OS. */
function openInGeelooyBrowser(target, context) {
	const os = window.awtsmoosOs || window.os;
	if (!os?.addWindow) {
		return false;
	}
	try {
		os.addWindow({
			os,
			path: context.path || "awtsmoos://shliach",
			programName: "awtsmoosBrowser",
			programOptions: {
				engineMode: "compatibility",
				initialUrl: target.url,
				shliachContext: context
			},
			title: "Awtsmoos Shliach"
		});
		return true;
	} catch (error) {
		return false;
	}
}

/** Copies the complete prompt for browsers that ignore or later change `?prompt=`. */
async function copyPrompt(prompt) {
	try {
		await navigator.clipboard?.writeText?.(prompt);
		return true;
	} catch (error) {
		return copyWithSelection(prompt);
	}
}

/** Uses a temporary textarea when the async Clipboard API is unavailable. */
function copyWithSelection(prompt) {
	try {
		const field = document.createElement("textarea");
		field.value = prompt;
		field.setAttribute("readonly", "");
		field.style.position = "fixed";
		field.style.opacity = "0";
		document.body.append(field);
		field.select();
		const copied = document.execCommand("copy");
		field.remove();
		return Boolean(copied);
	} catch (error) {
		return false;
	}
}
