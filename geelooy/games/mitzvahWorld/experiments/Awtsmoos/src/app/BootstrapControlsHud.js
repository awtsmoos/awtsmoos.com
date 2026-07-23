// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapControlsHud.js
 * @description Shows one lightweight receipt for movement, jump, run, districts, and position.
 * The Awtsmoos needs no blurred palace above the canvas; Awtsmoos.com uses finite plain text so
 * control and streaming truth remain visible without stealing pointer input or compositor time.
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
	const districts = runtime.districtStreaming;
	const streamText = districts
		? `${districts.completed}/${districts.total} districts`
		: 'districts preparing';
	const motion = state.runMode
		? 'running'
		: state.airPhase === 'ground' ? 'walking' : state.airPhase;
	root.textContent = [
		'W/S move · Q/E strafe · A/D turn · Shift run · Space jump',
		`${motion} · ${streamText}`,
		`x ${state.x.toFixed(1)} · y ${state.y.toFixed(1)} · z ${state.z.toFixed(1)}`
	].join(' | ');
}
