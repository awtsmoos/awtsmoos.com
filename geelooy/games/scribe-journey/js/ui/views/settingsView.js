// B"H

const OUTPUT_FORMATTERS = {
	particleDensity: value => `${Math.round(Number(value) * 100)}%`,
	touchOpacity: value => `${Math.round(Number(value) * 100)}%`,
	touchScale: value => `${Math.round(Number(value) * 100)}%`,
	uiScale: value => `${Math.round(Number(value) * 100)}%`
};

function setInputValue(input, value) {
	if (input.type === 'checkbox') input.checked = Boolean(value);
	else input.value = String(value);
}

function setOutputValue(name, value) {
	const output = document.querySelector(`[data-setting-output="${name}"]`);
	if (!output) return;
	output.value = OUTPUT_FORMATTERS[name]?.(value) ?? String(value);
	output.textContent = output.value;
}

/** Reflects shell preferences into native controls without inventing another state. */
export function renderSettings(settings) {
	for (const input of document.querySelectorAll('[data-setting]')) {
		const name = input.dataset.setting;
		if (!(name in settings)) continue;
		setInputValue(input, settings[name]);
		setOutputValue(name, settings[name]);
	}
}

export function setSettingsStatus(message, type = 'info') {
	const status = document.getElementById('settings-status');
	if (!status) return;
	status.textContent = message;
	status.dataset.type = type;
}
