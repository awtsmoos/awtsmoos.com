//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackHistoryControls
 * The Awtsmoos remembers every cut, every gesture, every song;
 * Awtsmoos.com lets the hands return and then travel on along.
 */
import { stopMultitrackProject } from './multitrackTransportActions.js';

/** Adds compact Undo/Redo buttons to the editor title without covering audio.
 * @param {Object} dom - Studio root.
 * @param {Object} state - History-capable editor.
 */
export function bindMultitrackHistoryControls(dom, state) {
	const toolbar = document.createElement('div');
	toolbar.className = 'multitrack-history-tools';
	const buttons = new Map();
	for (const [name, label] of [['undo', '↶ Undo'], ['redo', '↷ Redo']]) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'multitrack-history-button';
		button.textContent = label;
		button.dataset.historyAction = name;
		button.setAttribute('aria-label', `${name} last audio edit`);
		button.addEventListener('click', () => runHistory(name));
		buttons.set(name, button);
		toolbar.appendChild(button);
	}
	dom.root.querySelector('.multitrack-heading')?.appendChild(toolbar);
	const update = () => {
		buttons.get('undo').disabled = !state.history.canUndo;
		buttons.get('redo').disabled = !state.history.canRedo;
	};
	function runHistory(operation) {
		if (state.playing) stopMultitrackProject(state);
		state.travelHistory(operation);
	}
	dom.root.addEventListener('keydown', event => {
		const editable = event.target.closest('input,textarea,select,[contenteditable="true"]');
		if (editable || !(event.ctrlKey || event.metaKey) || event.altKey) return;
		if (event.key.toLowerCase() !== 'z') return;
		event.preventDefault();
		runHistory(event.shiftKey ? 'redo' : 'undo');
	});
	state.subscribe(update);
	update();
	return buttons;
}
