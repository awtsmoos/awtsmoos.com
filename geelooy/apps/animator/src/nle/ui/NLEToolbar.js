// B"H
// Boruch Hashem
// Blessed is He

/**
 * The toolbar is a crown of deliberate actions above created time. The Awtsmoos
 * renews each command while disabled states honestly reveal what can be changed.
 */
export class NLEToolbar {
	static render(state) {
		const history = state.history || {};
		const selected = Boolean(state.selectedClipId);
		return {
			tag: 'div',
			attrs: { className: 'aw-nle-toolbar' },
			children: [
				this.button('▶ Play', 'togglePlay'),
				this.button('↶ Undo', 'undoEdit', '', !history.canUndo),
				this.button('↷ Redo', 'redoEdit', '', !history.canRedo),
				this.button('✂ Split', 'splitClip', '', !selected),
				this.button('⧉ Duplicate', 'duplicateClip', '', !selected),
				this.button('Delete', 'deleteClip', '', !selected),
				this.button('+ Action', 'addActionClip'),
				this.button('+ Dialogue', 'addDialogueClip'),
				this.button('+ Camera', 'addCameraClip'),
				this.packageButton(state),
				this.button(
					state.mode === 'expanded' ? 'Hide' : 'Timeline',
					'cycleMode',
					'aw-nle-hide-btn'
				),
				this.packageStatus(state),
				{
					tag: 'div',
					attrs: { className: 'aw-nle-time' },
					text: `${this.clock(state.playhead)} / ${this.clock(state.duration)}`
				}
			].filter(Boolean)
		};
	}

	static packageButton(state) {
		const status = state.projectPackageStatus || 'idle';
		const labels = {
			idle: 'Export Package',
			building: 'Packaging…',
			ready: 'Export Again',
			error: 'Retry Package'
		};
		return this.button(
			labels[status] || labels.idle,
			'exportProjectPackage',
			'aw-nle-package-btn',
			status === 'building'
		);
	}

	static packageStatus(state) {
		const status = state.projectPackageStatus || 'idle';
		if (status === 'idle') {
			return null;
		}
		const messages = {
			building: 'Hashing durable voice and video…',
			ready: `${state.projectPackageFileCount || 0} files • ${state.projectPackageMode || 'saved'}`,
			error: state.projectPackageError || 'Package export failed.'
		};
		return {
			tag: 'span',
			attrs: { className: `aw-nle-package-status is-${status}` },
			text: messages[status]
		};
	}

	static button(text, action, extraClass = '', disabled = false) {
		return {
			tag: 'button',
			attrs: { className: `aw-nle-btn ${extraClass}`.trim(), disabled },
			on: { click: action },
			text
		};
	}

	static clock(milliseconds = 0) {
		const minutes = Math.floor(milliseconds / 60000);
		const seconds = Math.floor((milliseconds % 60000) / 1000);
		const millis = Math.floor(milliseconds % 1000);
		return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
	}
}
