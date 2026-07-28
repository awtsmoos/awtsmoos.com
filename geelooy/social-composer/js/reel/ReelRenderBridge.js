// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReelRenderBridge
 * @description
 * The Awtsmoos carries one real browser-rendered movie Blob into the canonical
 * social attachment river while preserving filename, MIME, title, and progress.
 */

import { renderReelMovie } from './ReelMovieRenderer.js';
import { ROOT_REEL_SCOPE } from './ReelUpload.js';

export async function renderAndAttachReel(studio, mediaActions, options = {}) {
	assertStudio(studio);
	const result = await renderReelMovie(studio, options);
	const file = reelFileFromResult(result);
	const [attachment] = mediaActions.add(ROOT_REEL_SCOPE, [file]);
	if (!attachment) throw new Error('The rendered reel could not be attached.');
	const projectTitle = String(studio.project?.title || 'MitzvahWorld movie').trim();
	mediaActions.update(ROOT_REEL_SCOPE, attachment.id, {
		caption: `Generated in MitzvahWorld · ${projectTitle}`
	});
	options.onAttached?.({ attachment, file, result });
	return { attachment, file, result };
}

export function reelFileFromResult(result = {}) {
	if (!(result.blob instanceof Blob) || !result.blob.size) {
		throw new Error('MitzvahWorld did not return a rendered movie Blob.');
	}
	const type = result.mimeType || result.blob.type || 'video/webm';
	const fileName = safeFileName(result.fileName, type);
	return new File([result.blob], fileName, {
		lastModified: Date.now(),
		type
	});
}

function assertStudio(studio) {
	if (!studio?.ready) throw new Error('MitzvahWorld Studio is not ready yet.');
	const nativeRecorder = typeof studio.recorder?.render === 'function';
	const socialNle = studio.runtime?.kind === 'social-nle';
	if (!nativeRecorder && !socialNle) {
		throw new Error('MitzvahWorld Studio cannot render in this browser.');
	}
}

function safeFileName(value, mimeType) {
	const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
	const source = String(value || `mitzvahworld-reel.${extension}`).trim();
	return source.replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '')
		|| `mitzvahworld-reel.${extension}`;
}
