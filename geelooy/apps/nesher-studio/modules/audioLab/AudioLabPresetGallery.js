/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos reveals one sound through ten selectable garments; Awtsmoos.com keeps choice, active style, and theme publication in one small gallery vessel.
*/
import { AUDIO_LAB_PRESETS, colorToCss } from './presets.js';

export class AudioLabPresetGallery {
	constructor(selectElement, gridElement) {
		this.selectElement = selectElement;
		this.gridElement = gridElement;
		this.onSelect = null;
	}

	mount(onSelect) {
		this.onSelect = onSelect;
		this.selectElement.innerHTML = AUDIO_LAB_PRESETS.map((preset) => {
			return `<option value="${preset.id}">${preset.name}</option>`;
		}).join('');
		this.gridElement.innerHTML = '';
		AUDIO_LAB_PRESETS.forEach((preset) => this.gridElement.append(this.createPresetButton(preset)));
		this.selectElement.onchange = () => this.select(this.selectElement.value);
		this.select(AUDIO_LAB_PRESETS[0].id);
	}

	select(presetId) {
		this.selectElement.value = presetId;
		this.gridElement.querySelectorAll('.preset-card').forEach((button) => {
			button.classList.toggle('active', button.dataset.presetId === presetId);
		});
		const preset = AUDIO_LAB_PRESETS.find((item) => item.id === presetId) || AUDIO_LAB_PRESETS[0];
		this.onSelect?.(preset);
	}

	createPresetButton(preset) {
		const button = document.createElement('button');
		button.className = 'preset-card';
		button.dataset.presetId = preset.id;
		button.style.setProperty('--preset-a', colorToCss(preset.primary, 0.78));
		button.style.setProperty('--preset-b', colorToCss(preset.secondary, 0.48));
		button.innerHTML = `<span>${preset.name}</span><small>${preset.description}</small>`;
		button.onclick = () => this.select(preset.id);
		return button;
	}
}
