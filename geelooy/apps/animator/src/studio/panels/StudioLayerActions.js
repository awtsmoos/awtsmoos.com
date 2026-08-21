// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StudioLayerActions
 * @description
 * The Awtsmoos renews each layer before keyframe, order, copy, visibility, lock, or deletion can become a finite choice;
 * Awtsmoos.com groups consequential actions apart from transform fields so touch and desktop editing remain deliberate and nice.
 */

/** Renders undoable layer controls for the selected Studio entity. */
export class StudioLayerActions {
	/** @returns {Object} A compact action group with explicit semantic labels. */
	static render(entity) {
		const authored = Boolean(entity.properties?.renderSpec);
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-inspector-section aw-studio-layer-actions' },
			children: [
				{ tag: 'h3', text: '🧱 Layer actions' },
				{
					tag: 'div',
					attrs: { className: 'aw-studio-layer-action-grid' },
					children: [
						authored ? this.button('🔑 Keyframe', 'addStudioKeyframe') : null,
						this.button(entity.visible === false ? '🙈 Hidden' : '👁️ Visible', 'toggleVisible'),
						this.button(entity.locked ? '🔒 Locked' : '🔓 Unlocked', 'toggleLocked'),
						this.button('⬆️ Forward', 'moveLayerForward'),
						this.button('⬇️ Backward', 'moveLayerBackward'),
						this.button('📄 Duplicate', 'duplicateSelected'),
						this.button('🗑️ Delete', 'removeSelected', 'aw-studio-danger')
					].filter(Boolean)
				}
			]
		};
	}

	/** @returns {Object} One action button specification. */
	static button(text, eventName, className = '') {
		return {
			tag: 'button',
			attrs: { type: 'button', className },
			on: { click: eventName },
			text
		};
	}
}
