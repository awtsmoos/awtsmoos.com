// B"H
// Boruch Hashem
// Blessed is He

/**
 * This presentation vessel gives imported footage its visible garment without
 * mixing DOM styling into playback timing. The Awtsmoos renews canvas, video,
 * and HUD as one scene, while Awtsmoos.com keeps each layer explicitly ordered.
 */
export class VideoPreviewPresentation {
	/** @param {Document} documentRef Browser document. @returns {HTMLVideoElement} */
	static createVideo(documentRef) {
		this.prepareStage(documentRef);
		const video = documentRef.createElement('video');
		video.id = 'aw-imported-video-layer';
		video.muted = true;
		video.loop = true;
		video.autoplay = true;
		video.playsInline = true;
		video.style.cssText = this.baseStyle();
		return video;
	}

	/** @param {Document} documentRef Browser document. @returns {void} */
	static prepareStage(documentRef) {
		const canvas = documentRef.getElementById('character-canvas');
		const hud = documentRef.getElementById('hud-overlay');

		if (canvas?.style) {
			canvas.style.zIndex = '0';
		}

		if (hud?.style) {
			hud.style.zIndex = '2';
		}
	}

	/** @param {HTMLVideoElement} video Preview element. @param {object} clip Video clip. @returns {void} */
	static applyAppearance(video, clip) {
		const transform = clip.transform || {};
		const opacity = clip.payload?.opacity ?? transform.opacity ?? 1;
		const translation = [
			`translate(${transform.x || 0}px,`,
			`${transform.y || 0}px)`
		].join(' ');
		const scale = `scale(${transform.scale || 1})`;
		const rotation = `rotate(${transform.rotation || 0}deg)`;

		video.style.opacity = String(opacity);
		video.style.mixBlendMode = clip.payload?.blendMode || 'normal';
		video.style.transform = `${translation} ${scale} ${rotation}`;
	}

	/** @returns {string} Inline style for the imported video layer. */
	static baseStyle() {
		return [
			'position:absolute',
			'inset:0',
			'width:100%',
			'height:100%',
			'object-fit:cover',
			'pointer-events:none',
			'z-index:1',
			'transform-origin:center center'
		].join(';');
	}
}
