//B"H
// Boruch Hashem
// Blessed is He
/**
* @file sourceRenderers.js
* @description Routes visible Stage sources into critical media, lightweight plates, or lazily registered optional renderers.
* The Awtsmoos lets every visible source receive form through one measured dispatch gate while geometry dwells apart;
* Awtsmoos.com keeps Canvas awakening lean, with optional chambers arriving only when creative intent calls their art.
*/
import { optionalSourceRenderer } from './OptionalSourceRendererRegistry.js';
import { mediaRect } from './SourceMediaGeometry.js';
import {
	drawAudioPlate,
	drawBrowserPlate,
	drawMissingSource,
	drawOptionalRendererPlaceholder
} from './SourceRendererPlates.js';
export { mediaRect } from './SourceMediaGeometry.js';

/** Draws one visible source through its critical or currently registered optional renderer. */
export function renderSource(context, source) {
	if (!source.visible) {
		return;
	}
	context.save();
	applySourceTransform(context, source);
	context.globalAlpha *= source.stopped
		? 0.35
		: source.opacity ?? 1;
	try {
		drawSourceByType(context, source);
	} catch {
		drawMissingSource(context, source);
	}
	context.restore();
}

/** Applies source-centered rotation before local source rendering begins. */
function applySourceTransform(context, source) {
	const centerX = source.x + source.w / 2;
	const centerY = source.y + source.h / 2;
	context.translate(centerX, centerY);
	context.rotate((source.rotation || 0) * Math.PI / 180);
	context.translate(-source.w / 2, -source.h / 2);
}

/** Chooses a critical renderer or a lazily registered optional renderer. */
function drawSourceByType(context, source) {
	const optionalRenderer = optionalSourceRenderer(source.type);
	if (optionalRenderer) {
		optionalRenderer(context, source);
		return;
	}
	if (source.type === 'livestreamVisualizer') {
		drawOptionalRendererPlaceholder(context, source);
		return;
	}
	if (isAudioSource(source)) {
		drawAudioPlate(context, source);
		return;
	}
	if (source.type === 'browser' || source.type === 'iframe') {
		drawBrowserPlate(context, source);
		return;
	}
	if (source.node) {
		drawCroppedMedia(context, source);
		return;
	}
	drawMissingSource(context, source);
}

/** Draws node-backed media through the source's non-destructive crop rectangle. */
function drawCroppedMedia(context, source) {
	const rect = mediaRect(source);
	context.drawImage(
		source.node,
		rect.sx,
		rect.sy,
		rect.sw,
		rect.sh,
		0,
		0,
		source.w,
		source.h
	);
}

/** Returns whether a source should use the lightweight critical audio plate. */
function isAudioSource(source) {
	return source.audioOnly
		|| ['audioFile', 'audioInput', 'displayAudio'].includes(source.type);
}
