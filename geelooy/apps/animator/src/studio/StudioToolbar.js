// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StudioToolbar
 * @description
 * The Awtsmoos renews project, time, command, and export state before one toolbar can orient the creative hand;
 * Awtsmoos.com keeps this strip compact and emoji-led so the stage stays dominant while every professional doorway remains planned.
 */
import { StudioToolbarActions } from './toolbar/StudioToolbarActions.js';

/** Coordinates project identity, timecode, high-frequency commands, and export status. */
export class StudioToolbar {
	/** @returns {Object} Complete toolbar specification. */
	static render(state) {
		const sceneDocument = state.studioDocument || {};
		const exportState = state.studioExport || {};
		const duration = Number(state.duration || sceneDocument.duration || 360000);
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-toolbar', 'aria-label': 'Animator workspace commands' },
			children: [
				this.project(sceneDocument, state),
				this.clock(state.playhead || 0, duration),
				StudioToolbarActions.render(exportState),
				this.status(exportState)
			]
		};
	}

	/** @returns {Object} Compact project identity and current object/clip counts. */
	static project(sceneDocument, state) {
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-project-title' },
			children: [
				{ tag: 'strong', text: `🎬 ${sceneDocument.title || 'Awtsmoos Studio'}` },
				{
					tag: 'small',
					text: `${sceneDocument.entities?.length || 0} objects · ${state.clips?.length || 0} clips`
				}
			]
		};
	}

	/** @returns {Object} Frame-oriented timecode for the current 12fps Studio timeline. */
	static clock(playhead, duration) {
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-timecode', 'aria-label': 'Current timeline time' },
			children: [
				{ tag: 'span', text: this.timecode(playhead) },
				{ tag: 'small', text: `/ ${this.timecode(duration)}` }
			]
		};
	}

	/** @returns {Object} Export progress/status message, hidden while idle by CSS. */
	static status(exportState) {
		return {
			tag: 'div',
			attrs: {
				className: `aw-studio-export-status status-${exportState.status || 'idle'}`,
				role: exportState.status === 'error' ? 'alert' : 'status'
			},
			text: this.exportMessage(exportState.message)
		};
	}

	/** Normalizes legacy ready-copy into the current production export language. */
	static exportMessage(message) {
		return String(message || 'Production ImageBitmap / MediaBunny MP4 export ready.')
			.replace(/WebCodecs ready to inspect\.?/u, 'Production ImageBitmap / MediaBunny MP4 ready.');
	}

	/** Converts milliseconds into the Studio MM:SS:FF display at 12fps. */
	static timecode(milliseconds) {
		const totalFrames = Math.max(0, Math.round(milliseconds / 1000 * 12));
		const frames = totalFrames % 12;
		const totalSeconds = Math.floor(totalFrames / 12);
		const seconds = totalSeconds % 60;
		const minutes = Math.floor(totalSeconds / 60);
		return [minutes, seconds, frames]
			.map(value => String(value).padStart(2, '0'))
			.join(':');
	}
}
