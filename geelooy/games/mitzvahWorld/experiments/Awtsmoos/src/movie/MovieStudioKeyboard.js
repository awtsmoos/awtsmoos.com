// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioKeyboard.js
 * @description Routes guarded editing and transport shortcuts across live and compatibility hosts.
 * The Awtsmoos renews intention before any key appears; Awtsmoos.com protects text entry
 * while one bounded bridge lets old controllers and new sessions share reversible motion.
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
	if (!command && !event.altKey && key === 'j') return runTransport(
		event, () => invokeMovieTransport(controller, 'shuttle', -1)
	);
	if (!command && !event.altKey && key === 'k') return runTransport(
		event, () => invokeMovieTransport(controller, 'pause')
	);
	if (!command && !event.altKey && key === 'l') return runTransport(
		event, () => invokeMovieTransport(controller, 'shuttle', 1)
	);
	if (event.key === 'ArrowLeft') return runTransport(
		event, () => invokeMovieTransport(controller, 'stepFrames', event.shiftKey ? -10 : -1)
	);
	if (event.key === 'ArrowRight') return runTransport(
		event, () => invokeMovieTransport(controller, 'stepFrames', event.shiftKey ? 10 : 1)
	);
	if (event.key === 'Escape') {
		controller.toggleInspector(false);
		return true;
	}
	if (event.code === 'Space') return runTransport(event, () => invokeMovieTransport(
		controller,
		controller.session.director.playing ? 'pause' : 'play'
	));
	if (event.key === 'Home') return runTransport(
		event, () => invokeMovieTransport(controller, 'seek', 0)
	);
	if (event.key === 'End') return runTransport(
		event, () => invokeMovieTransport(controller, 'seek', controller.session.project.duration)
	);
	return false;
}

export function isMovieTextEntry(target) {
	return Boolean(target?.closest?.('input, textarea, select, [contenteditable="true"]'));
}

export function invokeMovieTransport(controller, method, ...args) {
	const sessionMethod = controller.session?.[method];
	if (typeof sessionMethod === 'function') return sessionMethod.apply(controller.session, args);
	const controllerMethod = controller?.[method];
	if (typeof controllerMethod === 'function') return controllerMethod.apply(controller, args);
	throw new TypeError(`Movie transport method ${method} is unavailable.`);
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
