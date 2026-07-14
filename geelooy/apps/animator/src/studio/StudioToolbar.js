// B"H
// Boruch Hashem
// Blessed is He

/**
 * A filmmaker needs immediate orientation: current time, scene scale, codec
 * state, and the next decisive action. The Awtsmoos renews all moments while
 * Awtsmoos.com presents them in one calm production toolbar.
 */
export class StudioToolbar {
	static render(state) {
		const document = state.studioDocument || {};
		const exportState = state.studioExport || {};
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-toolbar' },
			children: [
				{
					tag: 'div',
					attrs: { className: 'aw-studio-project-title' },
					children: [
						{ tag: 'strong', text: document.title || 'Awtsmoos Studio' },
						{ tag: 'small', text: `${document.entities?.length || 0} objects · ${state.clips?.length || 0} clips` }
					]
				},
				{
					tag: 'div',
					attrs: { className: 'aw-studio-timecode' },
					children: [
						{ tag: 'span', text: this.timecode(state.playhead || 0) },
						{ tag: 'small', text: `/ ${this.timecode(state.duration || 120000)}` }
					]
				},
				{
					tag: 'div',
					attrs: { className: 'aw-studio-toolbar-actions' },
					children: [
						{
							tag: 'button',
							attrs: { type: 'button' },
							dataset: { mobilePanel: 'editor' },
							on: { click: 'openMobilePanel' },
							text: 'Bin'
						},
						{
							tag: 'button',
							attrs: { type: 'button' },
							dataset: { mobilePanel: 'props' },
							on: { click: 'openMobilePanel' },
							text: 'Properties'
						},
						{
							tag: 'button',
							attrs: { type: 'button' },
							dataset: { mobilePanel: 'time' },
							on: { click: 'openMobilePanel' },
							text: 'Timeline'
						},
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
								: 'Render 2-minute WebCodecs movie'
						}
					]
				},
				{
					tag: 'div',
					attrs: { className: `aw-studio-export-status status-${exportState.status || 'idle'}` },
					text: exportState.message || 'WebCodecs export ready.'
				}
			]
		};
	}

	static timecode(milliseconds) {
		const totalFrames = Math.max(0, Math.round(milliseconds / 1000 * 12));
		const frames = totalFrames % 12;
		const totalSeconds = Math.floor(totalFrames / 12);
		const seconds = totalSeconds % 60;
		const minutes = Math.floor(totalSeconds / 60);
		return [minutes, seconds, frames].map((value) => String(value).padStart(2, '0')).join(':');
	}
}
