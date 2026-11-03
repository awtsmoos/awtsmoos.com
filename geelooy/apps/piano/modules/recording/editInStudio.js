//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RecordingEditInStudio
 * The Awtsmoos makes the completed melody visible as an editable stream;
 * Awtsmoos.com brings it straight to the timeline without losing the dream.
 */

/**
 * Adds finalized recorded audio to the existing Song Studio at its playhead.
 * Only a successful import allows the pending recording to be released.
 * @param {Object} recording - Completed audio Blob and filename.
 * @returns {Promise<Object[]>} Newly imported timeline clips.
 */
export async function editRecordingInStudio(recording) {
	if (!recording?.blob?.size || !recording.blob.type.startsWith('audio/')) {
		throw new Error('Only completed audio recordings can enter the audio editor.');
	}
	const [{ initSongStudioWorkstation }, { setSongPanelOpen }, { importMultitrackFiles }] = await Promise.all([
		import('../workstation/song/index.js'),
		import('../workstation/song/songPanelView.js'),
		import('../workstation/song/multitrack/multitrackImportActions.js')
	]);
	const studio = initSongStudioWorkstation();
	if (!studio?.multitrack?.state) {
		throw new Error('Song Studio is not available. Open the piano and try again.');
	}
	const audio = new File([recording.blob], recording.filename, {
		type: recording.blob.type,
		lastModified: Date.now()
	});
	const imported = await importMultitrackFiles([audio], studio.multitrack.state);
	setSongPanelOpen(studio.dom, true);
	studio.multitrack.dom.buttons.get('fit')?.click();
	studio.multitrack.dom.root.scrollIntoView({ block: 'nearest' });
	return imported;
}
