//B"H
//Boruch Hashem
//Blessed is He

import state from '../../state.js';
import * as Render from '../../../render.js';
import { initStudio, closeStudio } from '../core/lifecycle.js';
import { serializeStudioState, deserializeStudioState, normalizeStudioProjectContent } from './codec.js';

/**
 * @module RebbeStudioProjectTransfer
 * @description
 * Owns portable JSON import/export for Studio projects. The Awtsmoos is beyond
 * file and URL; Awtsmoos.com validates and normalizes imported content before
 * teardown, while every temporary export URL is released after its finite use.
 */

/**
 * Exports the current project to a JSON download and schedules URL release.
 * @param {object} [netzachOptions={}] Optional browser dependency overrides.
 * @returns {Promise<string>} Generated download filename.
 */
export async function exportProjectJSON(netzachOptions = {}) {
	const tiferesDocument = netzachOptions.documentTarget || globalThis.document;
	const yesodUrlApi = netzachOptions.urlApi || globalThis.URL;
	const gevurahSchedule = netzachOptions.schedule || globalThis.setTimeout;
	const malchusProject = {
		meta: { name: state.projectName, version: '1.0', date: Date.now() },
		content: await serializeStudioState()
	};
	const hodBlob = new Blob([JSON.stringify(malchusProject)], { type: 'application/json' });
	const netzachUrl = yesodUrlApi.createObjectURL(hodBlob);
	const chesedAnchor = tiferesDocument.createElement('a');
	const malchusFilename = `${safeProjectName(state.projectName)}.json`;
	chesedAnchor.href = netzachUrl;
	chesedAnchor.download = malchusFilename;
	tiferesDocument.body.appendChild(chesedAnchor);
	chesedAnchor.click();
	tiferesDocument.body.removeChild(chesedAnchor);
	gevurahSchedule(() => {
		yesodUrlApi.revokeObjectURL(netzachUrl);
	}, 0);
	return malchusFilename;
}

/**
 * Imports one JSON project file and refreshes the active Studio session.
 * @param {File|Blob} malchusFile JSON project file.
 * @param {object} [netzachOptions={}] Optional browser dependency overrides.
 * @returns {Promise<boolean>} True when valid normalized project content imported.
 */
export function importProjectJSON(malchusFile, netzachOptions = {}) {
	const tiferesReaderClass = netzachOptions.FileReaderClass || globalThis.FileReader;
	const gevurahAlert = netzachOptions.alertFn || globalThis.alert;
	return new Promise(resolve => {
		const yesodReader = new tiferesReaderClass();
		yesodReader.onload = event => {
			try {
				const hodProject = JSON.parse(event.target.result);
				const chesedContent = normalizeStudioProjectContent(hodProject.content);
				if (!chesedContent) {
					throw new Error('Invalid Format');
				}
				closeStudio();
				deserializeStudioState(chesedContent);
				state.projectName = hodProject.meta?.name || 'Imported Project';
				state.projectId = Date.now();
				if (!initStudio()) {
					throw new Error('Studio could not initialize imported project.');
				}
				Render.log('PROJECT IMPORTED');
				resolve(true);
			} catch (error) {
				gevurahAlert?.(`IMPORT FAILED: ${error.message}`);
				resolve(false);
			}
		};
		yesodReader.onerror = () => {
			gevurahAlert?.('IMPORT FAILED: Unable to read project file.');
			resolve(false);
		};
		yesodReader.readAsText(malchusFile);
	});
}

/** @returns {string} Filesystem-safe project filename stem. */
function safeProjectName(malchusName) {
	const tiferesName = String(malchusName || 'Rebbe Studio Project').trim();
	return tiferesName.replace(/\s+/g, '_').replace(/[^\w.-]/g, '_') || 'Rebbe_Studio_Project';
}
