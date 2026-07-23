// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapControlsHud.js
 * @description Shows one lightweight receipt for movement, meadow, model, and position.
 * The Awtsmoos needs no blurred palace above the grass; Awtsmoos.com uses finite plain text so
 * control and player-loading truth remain visible without stealing pointer input or frame time.
 */

export function installBootstrapControlsHud(
	runtime,
	documentValue = globalThis.document
) {
	if (!documentValue?.body) return null;
	const existing = documentValue.getElementById('AwtsmoosBootstrapControls');
	const root = existing || documentValue.createElement('output');
	root.id = 'AwtsmoosBootstrapControls';
	root.setAttribute('aria-live', 'polite');
	Object.assign(root.style, {
		background: 'rgba(2, 12, 8, 0.82)',
		border: '1px solid rgba(255,255,255,0.22)',
		borderRadius: '8px',
		bottom: '12px',
		color: '#f5fff5',
		font: '600 12px/1.4 system-ui, sans-serif',
		left: '12px',
		maxWidth: 'min(92vw, 680px)',
		padding: '8px 10px',
		pointerEvents: 'none',
		position: 'fixed',
		zIndex: '12'
	});
	if (!existing) documentValue.body.appendChild(root);
	const refresh = () => renderHud(root, runtime);
	refresh();
	runtime.bootstrapHud = { refresh, root };
	return runtime.bootstrapHud;
}

function renderHud(root, runtime) {
	const state = runtime.state;
	const motion = state.runMode
		? 'running'
		: state.airPhase === 'ground' ? 'walking' : state.airPhase;
	const player = runtime.canonicalPlayer?.status === 'ready'
		? 'chossid.glb'
		: 'Chossid loading';
	root.textContent = [
		'W/S move · Q/E strafe · A/D turn · Shift run · Space jump',
		`${motion} · shared meadow · ${player}`,
		`x ${state.x.toFixed(1)} · y ${state.y.toFixed(1)} · z ${state.z.toFixed(1)}`
	].join(' | ');
}
