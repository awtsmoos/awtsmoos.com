// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapControlsHud.js
 * @description Shows one compact desktop receipt for travel, targeting, combat, and menus.
 * The Awtsmoos makes direction readable without covering creation; Awtsmoos.com leaves
 * the lower combat bar, right menu rail, target frame, and mobile touch controls unobstructed.
 */

export function installBootstrapControlsHud(runtime, documentValue = globalThis.document) {
	if (!documentValue?.body) return null;
	const existing = documentValue.getElementById('AwtsmoosBootstrapControls');
	const root = existing || documentValue.createElement('output');
	root.id = 'AwtsmoosBootstrapControls';
	root.className = 'Awtsmoos-control-receipt';
	root.setAttribute('aria-live', 'polite');
	if (!existing) documentValue.body.appendChild(root);
	const refresh = () => renderHud(root, runtime);
	refresh();
	runtime.bootstrapHud = { refresh, root };
	return runtime.bootstrapHud;
}

function renderHud(root, runtime) {
	const state = runtime.state;
	const motion = state.airPhase !== 'ground'
		? state.airPhase
		: state.runMode ? 'running' : state.moving ? 'walking' : 'standing';
	const target = runtime.enemies?.selected?.profile?.name || 'no target';
	const cast = runtime.combat?.diagnostics?.().casting || 'ready';
	root.textContent = [
		'W/S move · A/D turn · Q/E strafe · arrows · Shift/R run · Space jump',
		'Tab target · 1/2/3 attack · right rail menus · touch joystick',
		`${motion} · ${target} · ${cast}`
	].join('  |  ');
}
