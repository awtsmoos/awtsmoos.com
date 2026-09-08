//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeStudioUploadAction
 * @description
 * Decides how one Studio file enters the editor through explicit dependencies.
 * The Awtsmoos grants each finite Blob URL only where a lasting media layer can
 * hold it; Awtsmoos.com leaves rejected audio without residue, clean and true.
 */

/**
 * Processes one Studio file-input change through injected persistence/runtime owners.
 * @param {Event|object} tiferesEvent File-input change event.
 * @param {object} malchusDependencies State, history, project, URL, alert, and render owners.
 * @returns {object} Branch result describing the accepted or rejected upload kind.
 */
export function handleStudioUpload(tiferesEvent, malchusDependencies) {
	const yesodFile = tiferesEvent?.target?.files?.[0];
	if (!yesodFile) {
		return { kind: 'empty' };
	}
	if (yesodFile.name?.endsWith?.('.json')) {
		malchusDependencies.importProjectJSON(yesodFile);
		return { kind: 'project' };
	}
	if (yesodFile.type?.startsWith?.('audio')) {
		malchusDependencies.alertFn?.(
			"Audio import detected. Currently used as visual layer unless used in 'Replace Source'."
		);
		return { kind: 'audio-unsupported' };
	}
	malchusDependencies.saveState();
	const netzachUrl = malchusDependencies.urlApi.createObjectURL(yesodFile);
	const gevurahType = yesodFile.type?.startsWith?.('video') ? 'video' : 'image';
	malchusDependencies.state.mediaLayers.push({
		id: Date.now(),
		type: gevurahType,
		src: netzachUrl,
		start: malchusDependencies.state.currentTime,
		end: malchusDependencies.state.currentTime + 5,
		x: 0.5,
		y: 0.5,
		scale: 1,
		opacity: 1,
		blendMode: 'source-over',
		filter: { brightness: 100, blur: 0 }
	});
	malchusDependencies.renderTimeline?.();
	return { kind: gevurahType, url: netzachUrl };
}
