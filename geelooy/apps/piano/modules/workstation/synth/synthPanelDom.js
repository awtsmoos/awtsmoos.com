//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthPanelDom
 * @description
 * Malchus reveals a compact launcher and spacious workstation while the Awtsmoos remains beyond open, closed, sound, and silence.
 * Awtsmoos.com keeps shell construction separate from synthesis logic,
 * giving Presets, deep controls, Performance and an emergency Panic command one mobile-safe vessel without rewriting legacy HTML.
 */

/**
 * Creates the Pro Synth launcher, panel shell, header actions, body hosts, and status line.
 *
 * @returns {Object} Stable DOM references consumed by panel coordinators.
 */
export function createSynthPanelDom() {
	const launcher = createButton(
		'pro-synth-launcher',
		'🎛 Pro Synth',
		'Open Pro Synth workstation'
	);
	const panel = document.createElement('section');
	panel.id = 'pro-synth-panel';
	panel.className = 'pro-synth-panel pro-synth-hidden';
	panel.setAttribute('aria-label', 'Pro Synth workstation');
	const header = document.createElement('header');
	header.className = 'pro-synth-header';
	const title = document.createElement('div');
	title.className = 'pro-synth-title';
	title.innerHTML = '<strong>🎛 Pro Synth</strong><span>46 sounds · synth · performance</span>';
	const actions = document.createElement('div');
	actions.className = 'pro-synth-header-actions';
	const panic = createButton(
		'pro-synth-panic',
		'⚠ Panic',
		'Stop all notes and clear performance state'
	);
	const close = createButton(
		'pro-synth-close',
		'✕',
		'Close Pro Synth'
	);
	actions.append(panic, close);
	header.append(title, actions);
	const body = document.createElement('div');
	body.className = 'pro-synth-body';
	const presetHost = document.createElement('div');
	presetHost.className = 'pro-synth-preset-host';
	const controlsHost = document.createElement('div');
	controlsHost.className = 'pro-synth-controls-host';
	const status = document.createElement('div');
	status.className = 'pro-synth-status';
	status.textContent = 'LIVE reshapes sounding voices · NEXT NOTE rebuilds character · PERFORM changes playing behavior.';
	body.append(presetHost, controlsHost);
	panel.append(header, body, status);
	return {
		launcher,
		panel,
		panic,
		close,
		presetHost,
		controlsHost,
		status
	};
}

/**
 * Mounts the launcher into settings and the floating panel under document.body.
 *
 * @param {Object} dom - Pro Synth shell references.
 * @param {HTMLElement} settingsHost - Existing settings-content container.
 * @returns {void}
 */
export function mountSynthPanelDom(dom, settingsHost) {
	settingsHost.appendChild(dom.launcher);
	document.body.appendChild(dom.panel);
}

function createButton(className, text, ariaLabel) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = className;
	button.textContent = text;
	button.setAttribute('aria-label', ariaLabel);
	return button;
}
