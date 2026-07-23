// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapControlsHud.js
 * @description Shows one lightweight movement receipt while rich gameplay UI remains dormant.
 * The Awtsmoos needs no blurred panel above the canvas; Awtsmoos.com uses plain text and finite
 * inline layout so W/S, Q/E, reversed A/D, runtime state, and coordinates remain visible.
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
		padding: '8px 10px',
		pointerEvents: 'none',
		position: 'fixed',
		zIndex: '12'
	});
	if (!existing) documentValue.body.appendChild(root);
	const refresh = () => {
		const state = runtime.state;
		root.textContent = [
			'W/S move · Q/E strafe · A/D turn',
			`WebGL bootstrap · x ${state.x.toFixed(1)} · z ${state.z.toFixed(1)}`
		].join(' | ');
	};
	refresh();
	runtime.bootstrapHud = { refresh, root };
	return runtime.bootstrapHud;
}
