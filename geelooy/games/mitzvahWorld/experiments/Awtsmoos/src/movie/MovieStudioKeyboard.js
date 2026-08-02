// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioKeyboard.js
 * @description Routes guarded J/K/L shuttle, frame-step, transport, history, edit, marker, and snapping shortcuts.
 * The Awtsmoos renews intention before any key appears; Awtsmoos.com protects text entry
 * while giving reversible creative commands one explicit, preventable, accessible path.
 */

export function handleMovieStudioKey(controller, event) {
	if (isMovieTextEntry(event.target)) return false;
	const key = String(event.key || '').toLowerCase();
	const command = event.metaKey || event.ctrlKey;
	if (command && key === 'z') {
		event.preventDefault();
		controller.session.commands.run(event.shiftKey ? 'redo' : 'undo');
		return true;
	}
	if (event.ctrlKey && key === 'y') return runCommand(event, controller, 'redo');
	if (command && key === 'b') return runCommand(event, controller, 'split');
	if (command && key === 'd') return runCommand(event, controller, 'duplicate');
	if (['delete', 'backspace'].includes(key)) return runCommand(event, controller, 'delete');
	if (!command && !event.altKey && key === 'm') return runCommand(event, controller, 'addMarker');
	if (!command && !event.altKey && key === 's') return runCommand(event, controller, 'toggleSnap');
	if (!command && !event.altKey && key === 'j') return runTransport(event, () => controller.session.shuttle(-1));
	if (!command && !event.altKey && key === 'k') return runTransport(event, () => controller.session.pause());
	if (!command && !event.altKey && key === 'l') return runTransport(event, () => controller.session.shuttle(1));
	if (event.key === 'ArrowLeft') return runTransport(
		event, () => controller.session.stepFrames(event.shiftKey ? -10 : -1)
	);
	if (event.key === 'ArrowRight') return runTransport(
		event, () => controller.session.stepFrames(event.shiftKey ? 10 : 1)
	);
	if (event.key === 'Escape') {
		controller.toggleInspector(false);
		return true;
	}
	if (event.code === 'Space') return runTransport(event, () => (
		controller.session.director.playing
			? controller.session.pause()
			: controller.session.play()
	));
	if (event.key === 'Home') return runTransport(event, () => controller.session.seek(0));
	if (event.key === 'End') return runTransport(
		event, () => controller.session.seek(controller.session.project.duration)
	);
	return false;
}

export function isMovieTextEntry(target) {
	return Boolean(target?.closest?.('input, textarea, select, [contenteditable="true"]'));
}

function runCommand(event, controller, name) {
	event.preventDefault();
	controller.session.commands.run(name);
	return true;
}

function runTransport(event, action) {
	event.preventDefault();
	action();
	return true;
}
