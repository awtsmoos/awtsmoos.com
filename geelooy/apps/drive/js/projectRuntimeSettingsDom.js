//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveProjectRuntimeSettingsDom
 * @description
 * The Awtsmoos lets runtime desire become visible without confusing a remembered recipe with a connected machine;
 * Awtsmoos.com shows portable cwd, entry, port, and arguments only for native compute, while Tunnel identity remains live testimony beyond this frame.
 */

const RUNTIME_OPTIONS = [
	['static', 'Static site'],
	['native-compute', 'Connected Tunnel machine · native Node'],
	['trusted-node', 'Trusted hosted Node'],
	['tenant-node', 'Isolated tenant Node · blocked until proven']
];

/**
 * Build runtime preference and secret-free native-compute recipe fields.
 * @param {object} plan Current normalized project plan.
 * @returns {object} Runtime form field vessels.
 */
export function createRuntimeSettingsFields(plan) {
	const recipe = plan.intent?.runtimeRecipe || {};
	const runtime = selectField(
		'Runtime preference',
		plan.intent?.runtimePreference || 'static'
	);
	const runtimeCwd = field(
		'Device project directory',
		recipe.cwd || '',
		'/Users/you/project'
	);
	const runtimeEntry = field(
		'Node entry file',
		recipe.entry || 'server.js',
		'server.js'
	);
	const runtimePort = field(
		'Local server port',
		String(recipe.port || 3000),
		'3000',
		'number'
	);
	const runtimeArgs = field(
		'Node arguments · JSON array',
		JSON.stringify(recipe.args || []),
		'["--mode","dev"]'
	);
	const nativeFields = [runtimeCwd, runtimeEntry, runtimePort, runtimeArgs];
	runtime.input.addEventListener('change', updateVisibility);
	updateVisibility();
	return { runtime, runtimeCwd, runtimeEntry, runtimePort, runtimeArgs };

	function updateVisibility() {
		const visible = runtime.value === 'native-compute';
		for (const item of nativeFields) {
			item.label.hidden = !visible;
		}
	}
}

/** Extract runtime values without claiming server-side validation. */
export function readRuntimeSettingsFields(fields) {
	return {
		runtimePreference: fields.runtime.value,
		runtimeCwd: fields.runtimeCwd.value,
		runtimeEntry: fields.runtimeEntry.value,
		runtimePort: fields.runtimePort.value,
		runtimeArgs: fields.runtimeArgs.value
	};
}

function selectField(labelText, value) {
	const input = element('select');
	for (const [key, title] of RUNTIME_OPTIONS) {
		const option = element('option');
		option.value = key;
		option.textContent = title;
		option.selected = key === value;
		input.append(option);
	}
	return fieldVessel(labelText, input);
}

function field(labelText, value = '', placeholder = '', type = 'text') {
	const input = element('input');
	input.type = type;
	input.value = value;
	input.placeholder = placeholder;
	if (type === 'number') {
		input.min = '1';
		input.max = '65535';
	}
	return fieldVessel(labelText, input);
}

function fieldVessel(labelText, input) {
	const label = element('label', 'project-settings__field');
	const title = element('span');
	title.textContent = labelText;
	label.append(title, input);
	return {
		input,
		label,
		get value() {
			return input.value.trim();
		}
	};
}

function element(tagName, className = '') {
	const item = document.createElement(tagName);
	item.className = className;
	return item;
}
