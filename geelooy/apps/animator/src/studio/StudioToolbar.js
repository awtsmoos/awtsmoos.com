// B"H
// Boruch Hashem
// Blessed is He

/**
 * A filmmaker needs immediate orientation: current time, scene scale, codec
 * state, and the next decisive action. The Awtsmoos renews all moments while
 * Awtsmoos.com names the real production-canvas MediaBunny export promise.
 */
export class StudioToolbar {
	static render(state) {
		const sceneDocument = state.studioDocument || {};
		const exportState = state.studioExport || {};
		const duration = Number(state.duration || sceneDocument.duration || 360000);
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-toolbar' },
			children: [
				this.project(sceneDocument, state),
				this.clock(state.playhead || 0, duration),
				this.actions(exportState, duration),
				this.status(exportState)
			]
		};
	}

	static project(sceneDocument, state) {
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-project-title' },
			children: [
				{ tag: 'strong', text: sceneDocument.title || 'Awtsmoos Studio' },
				{
					tag: 'small',
					text: `${sceneDocument.entities?.length || 0} objects · ${state.clips?.length || 0} clips`
				}
			]
		};
	}

	static clock(playhead, duration) {
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-timecode' },
			children: [
				{ tag: 'span', text: this.timecode(playhead) },
				{ tag: 'small', text: `/ ${this.timecode(duration)}` }
			]
		};
	}

	static actions(exportState, duration) {
		const minutes = Math.round(duration / 60000);
		const mobile = [
			['editor', 'Bin'],
			['props', 'Properties'],
			['time', 'Timeline']
		].map(([panel, label]) => ({
			tag: 'button',
			attrs: { type: 'button' },
			dataset: { mobilePanel: panel },
			on: { click: 'openMobilePanel' },
			text: label
		}));
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-toolbar-actions' },
			children: [
				...mobile,
				{
					tag: 'button',
					attrs: {
						className: 'aw-studio-export-button',
						type: 'button',
						disabled: exportState.status === 'rendering'
					},
					on: { click: 'exportMovie' },
					text: exportState.status === 'rendering'
						? `Rendering ${Math.round((exportState.progress || 0) * 100)}%`
						: `Render ${minutes}-minute production MP4`
				}
			]
		};
	}

	static status(exportState) {
		return {
			tag: 'div',
			attrs: {
				className: `aw-studio-export-status status-${exportState.status || 'idle'}`
			},
			text: this.exportMessage(exportState.message)
		};
	}

	static exportMessage(message) {
		return String(message || 'Production ImageBitmap / MediaBunny MP4 export ready.')
			.replace(/WebCodecs ready to inspect\.?/u, 'Production ImageBitmap / MediaBunny MP4 ready.');
	}

	static timecode(milliseconds) {
		const totalFrames = Math.max(0, Math.round(milliseconds / 1000 * 12));
		const frames = totalFrames % 12;
		const totalSeconds = Math.floor(totalFrames / 12);
		const seconds = totalSeconds % 60;
		const minutes = Math.floor(totalSeconds / 60);
		return [minutes, seconds, frames]
			.map((value) => String(value).padStart(2, '0'))
			.join(':');
	}
}
