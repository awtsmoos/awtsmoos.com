// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StudioToolbarActions
 * @description
 * The Awtsmoos renews navigation, history, character craft, and export before one compact command strip can appear;
 * Awtsmoos.com keeps emoji identity visible on every viewport while deeper controls remain inside retractable panels clear.
 */

const PANEL_ACTIONS = Object.freeze([
	['✏️', 'Create', 'openCreatePanel'],
	['🧱', 'Layers', 'openLayersPanel'],
	['🧠', 'AI', 'openAiPanel'],
	['⚙️', 'Properties', 'openPropertiesPanel'],
	['🗓️', 'Timeline', 'openTimelinePanel']
]);

/** Renders high-frequency workspace navigation, history, character, and export commands. */
export class StudioToolbarActions {
	/** @returns {Object} Compact toolbar action group. */
	static render(exportState = {}) {
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-toolbar-actions' },
			children: [
				this.command('↩️', 'Undo', 'undo'),
				this.command('↪️', 'Redo', 'redo'),
				...PANEL_ACTIONS.map(action => this.command(...action)),
				this.command('🧑', 'Character', 'openCharacterLab'),
				this.exportButton(exportState)
			]
		};
	}

	/** @returns {Object} One emoji-first command with a collapsible text label. */
	static command(emoji, label, eventName) {
		return {
			tag: 'button',
			attrs: {
				type: 'button',
				className: 'aw-studio-command',
				title: label,
				'aria-label': label
			},
			on: { click: eventName },
			children: [
				{ tag: 'span', attrs: { className: 'aw-studio-command-emoji', 'aria-hidden': 'true' }, text: emoji },
				{ tag: 'span', attrs: { className: 'aw-studio-command-label' }, text: label }
			]
		};
	}

	/** @returns {Object} MP4 export action with accessible progress feedback. */
	static exportButton(exportState = {}) {
		const rendering = exportState.status === 'rendering';
		const percent = Math.round((exportState.progress || 0) * 100);
		return {
			tag: 'button',
			attrs: {
				className: 'aw-studio-command aw-studio-export-button',
				type: 'button',
				disabled: rendering,
				'aria-busy': rendering ? 'true' : 'false',
				'aria-label': rendering ? `Rendering movie ${percent}%` : 'Render production MP4',
				title: 'Render production MP4'
			},
			on: { click: 'exportMovie' },
			children: [
				{ tag: 'span', attrs: { className: 'aw-studio-command-emoji', 'aria-hidden': 'true' }, text: rendering ? '⏳' : '💾' },
				{ tag: 'span', attrs: { className: 'aw-studio-command-label' }, text: rendering ? `${percent}%` : 'Render' }
			]
		};
	}
}
