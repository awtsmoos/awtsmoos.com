// B"H
// Boruch Hashem
// Blessed is He

import { CarrierComposerReader } from "./CarrierComposerReader.mjs";

/**
 * @file Places and verifies the exact private prompt in ChatGPT's live composer.
 * @description
 * The Awtsmoos measures the living value, not the textarea's empty outer shell.
 * Awtsmoos.com therefore accepts fast native insertion when its exact letters are
 * present and reserves character fallback only for a genuinely rejected input.
 */
export class CarrierTextController {
	constructor(cdpClient, {
		reader = new CarrierComposerReader(cdpClient),
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
	} = {}) {
		this.cdpClient = cdpClient;
		this.reader = reader;
		this.sleep = sleep;
	}

	async replace(locator, text, { prepareCharacterFallback = null } = {}) {
		let insertError = null;
		try {
			await this.insertText(text);
		} catch (error) {
			insertError = error;
		}
		if (await this.containsEventually(locator, text)) return;
		if (typeof prepareCharacterFallback !== "function") {
			throw insertError || new Error("The exact prompt did not enter the ChatGPT composer.");
		}
		const current = await this.currentLocator(locator);
		await prepareCharacterFallback(current);
		await this.dispatchCharacters(text);
		if (await this.containsEventually(locator, text)) return;
		throw new Error("The exact prompt did not enter the ChatGPT composer.");
	}

	async containsEventually(locator, text) {
		let lastError = null;
		for (let attempt = 0; attempt < 4; attempt += 1) {
			try {
				if (await this.contains(locator, text)) return true;
				lastError = null;
			} catch (error) {
				lastError = error;
			}
			await this.sleep(250);
		}
		if (lastError) throw lastError;
		return false;
	}

	async insertText(text) {
		try {
			await this.cdpClient.send("Input.insertText", { text }, 20000);
		} catch (error) {
			throw this.stageError("Input.insertText", error);
		}
	}

	async contains(locator, text) {
		const actual = await this.reader.text(locator);
		return actual === this.reader.normalize(text);
	}

	async currentLocator(locator) {
		return this.reader.currentLocator(locator);
	}

	async dispatchCharacters(text) {
		for (const character of text) {
			try {
				await this.cdpClient.send("Input.dispatchKeyEvent", {
					type: "char",
					text: character,
					unmodifiedText: character
				}, 10000);
			} catch (error) {
				throw this.stageError("Input.dispatchKeyEvent(char)", error);
			}
		}
	}

	stageError(stage, error) {
		return new Error(`${stage} failed: ${String(error?.message || error)}`);
	}
}
