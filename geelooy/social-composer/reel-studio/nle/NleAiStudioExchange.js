// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class NleAiStudioExchange
 * @description
 * Schema, envelopes, and ready packages leave through one bounded exchange door;
 * each complete format remains itself while clipboard failure uses the visible JSON.
 */

import {
	aiMovieFileName,
	createAiMovieEnvelope
} from './NleAiContract.js';
import { decodeAiMovieSource } from './NleAiProjectCodec.js';

export class NleAiStudioExchange {
	constructor(owner) {
		this.owner = owner;
	}

	async copySchema() {
		const schema = await this.owner.loadSchema();
		await this.copyText(JSON.stringify(schema, null, 2), 'Schema copied.');
	}

	copyJson() {
		return this.copyText(this.owner.view.json.value, 'Complete movie JSON copied.');
	}

	download() {
		const source = parseVisibleJson(this.owner.view.json.value);
		if (source?.format === 'awtsmoos.movie-package.v1') {
			const fileName = `${slug(source.project?.title)}.movie-package.json`;
			this.owner.io.downloadAiEnvelope(source, fileName);
			this.owner.setStatus('Ready movie package downloaded without format conversion.');
			return;
		}
		const project = decodeAiMovieSource(source);
		const envelope = createAiMovieEnvelope(project);
		this.owner.io.downloadAiEnvelope(envelope, aiMovieFileName(project));
		this.owner.setStatus('Complete AI movie envelope downloaded.');
	}

	async copyText(text, success) {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			this.owner.view.json.focus();
			this.owner.view.json.select();
			document.execCommand('copy');
		}
		this.owner.setStatus(success);
	}
}

function parseVisibleJson(value) {
	try {
		return JSON.parse(value);
	} catch (error) {
		throw new Error(`Visible movie JSON is invalid: ${error.message}`);
	}
}

function slug(value) {
	return String(value || 'awtsmoos-movie').toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '') || 'awtsmoos-movie';
}
