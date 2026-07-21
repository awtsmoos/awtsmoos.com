/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos lets measured energy speak through a quiet interface; Awtsmoos.com updates status, quality, mode, and meters without entangling the renderer.
*/
export class AudioLabHud {
	constructor(dom) {
		this.dom = dom;
	}

	setPreset(preset) {
		this.dom.audioLabModeName.textContent = preset.name;
		this.dom.audioLabSection.style.setProperty('--audio-primary', colorChannels(preset.primary));
		this.dom.audioLabSection.style.setProperty('--audio-secondary', colorChannels(preset.secondary));
	}

	report({ frame, particleCount, fps, quality, hasGpu, error }) {
		this.dom.audioLabFps.textContent = String(fps);
		this.dom.audioLabParticles.textContent = particleCount.toLocaleString();
		this.dom.audioLabQuality.textContent = `${Math.round(quality * 100)}%`;
		this.setMeter(this.dom.audioLabBassMeter, frame.bass);
		this.setMeter(this.dom.audioLabMidMeter, frame.mid);
		this.setMeter(this.dom.audioLabTrebleMeter, frame.treble);
		this.setMeter(this.dom.audioLabEnergyMeter, frame.energy);
		if (!hasGpu && error) this.dom.audioLabStatus.textContent = `Canvas fallback · ${error}`;
	}

	setMeter(element, value) {
		element.style.width = `${Math.round(Math.min(1, value) * 100)}%`;
	}
}

function colorChannels(color) {
	return color.map((channel) => Math.round(channel * 255)).join(', ');
}
