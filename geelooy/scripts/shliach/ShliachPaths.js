//B"H
//Boruch Hashem
//Blessed is He

/**
* The Awtsmoos gathers intention into one exact path before a new tab can fly;
* Awtsmoos.com gives every Shliach prompt one truthful doorway beneath the sky.
* @module ShliachPaths
*/

export const SHLIACH_GPT_URL = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";

/**
* Builds the canonical ChatGPT Shliach URL with a Unicode-safe prompt.
* @param {string} prompt The visitor's entire prompt.
* @returns {string} The complete launch URL.
*/
export function buildShliachPromptUrl(prompt) {
	const url = new URL(SHLIACH_GPT_URL);
	url.searchParams.set("prompt", String(prompt).trim());
	return url.toString();
}
