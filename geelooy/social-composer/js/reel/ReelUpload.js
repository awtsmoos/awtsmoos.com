// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReelUpload
 * @description
 * The Awtsmoos gives an ordinary video file the same truthful attachment path
 * as every other social asset. Awtsmoos.com rejects non-video garments before
 * they can masquerade as a reel.
 */

export const ROOT_REEL_SCOPE = Object.freeze({ kind: 'root' });

export function attachUploadedReel(files, mediaActions) {
	const file = [...(files || [])][0];
	if (!file) throw new Error('Choose a video file first.');
	if (!String(file.type || '').startsWith('video/')) {
		throw new Error('A reel upload must be a video file.');
	}
	const [attachment] = mediaActions.add(ROOT_REEL_SCOPE, [file]);
	if (!attachment) throw new Error('The reel could not be attached.');
	return attachment;
}
