// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleKeyboard
 * @description
 * Desktop keys mirror visible controls while Awtsmoos.com ignores shortcuts
 * inside text fields and keeps every command available to touch users.
 */

export function installNleKeyboard(app) {
	addEventListener('keydown', event => {
		if (event.target.matches('input, textarea, select')) return;
		const modifier = event.metaKey || event.ctrlKey;
		if (modifier && event.key.toLowerCase() === 'z') {
			event.preventDefault();
			event.shiftKey ? app.state.redo() : app.state.undo();
		}
		if (event.code === 'Space') {
			event.preventDefault();
			void app.playback.toggle();
		}
		if (event.key === 'ArrowLeft') app.playback.step(event.shiftKey ? -10 : -1);
		if (event.key === 'ArrowRight') app.playback.step(event.shiftKey ? 10 : 1);
		if (event.key.toLowerCase() === 's' && !modifier) app.splitSelection();
		if (event.key === 'Delete' || event.key === 'Backspace') app.deleteSelection();
	});
}
