/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos gives the living field a focused conductor; Awtsmoos.com joins input, gallery, HUD, adaptive renderer, motion controls, and safe Stage handoff.
*/
import { AudioInputBridge } from './AudioInputBridge.js';
import { AudioLabHud } from './AudioLabHud.js';
import { AudioLabPresetGallery } from './AudioLabPresetGallery.js';
import { AudioLabRenderer } from './AudioLabRenderer.js';
import { addAudioLabSourceToStage } from './audioLabStageSource.js';
import { audioLabPresetById } from './presets.js';

export class AudioLabController {
	constructor({ dom, state, changed, setStatus }) {
		this.dom = dom;
		this.state = state;
		this.changed = changed;
		this.setStatus = setStatus;
		this.inputBridge = new AudioInputBridge();
		this.hud = new AudioLabHud(dom);
		this.gallery = new AudioLabPresetGallery(dom.audioLabPreset, dom.audioLabPresetGrid);
		this.renderer = new AudioLabRenderer({
			dom,
			inputBridge: this.inputBridge,
			readConfiguration: () => this.readConfiguration(),
			reportFrame: (report) => this.hud.report(report)
		});
	}

	bind() {
		this.gallery.mount((preset) => this.hud.setPreset(preset));
		this.bindControls();
		this.updateReadouts();
		window.addEventListener('nesher:pagechange', (event) => {
			this.renderer.setActive(event.detail?.page === 'audio');
		});
		this.renderer.setActive(!this.dom.audioLabSection.hidden);
		return this;
	}

	bindControls() {
		this.dom.audioLabDemo.onclick = () => this.useDemo();
		this.dom.audioLabStartMic.onclick = () => this.useMicrophone();
		this.dom.audioLabAddStage.onclick = () => this.addToStage();
		this.dom.audioLabInput.onchange = () => this.changeInput();
		[this.dom.audioLabDensity, this.dom.audioLabSensitivity, this.dom.audioLabFlow].forEach((control) => {
			control.oninput = () => this.updateReadouts();
		});
	}

	changeInput() {
		if (this.dom.audioLabInput.value === 'microphone') this.useMicrophone();
		else this.useDemo();
	}

	useDemo() {
		this.inputBridge.useDemo();
		this.dom.audioLabInput.value = 'demo';
		this.dom.audioLabStatus.textContent = 'Procedural demo current active';
	}

	async useMicrophone() {
		try {
			await this.inputBridge.useMicrophone();
			this.dom.audioLabInput.value = 'microphone';
			this.dom.audioLabStatus.textContent = 'Microphone spectrum active';
		} catch (error) {
			this.dom.audioLabInput.value = 'demo';
			this.dom.audioLabStatus.textContent = `Microphone unavailable: ${error.message}`;
		}
	}

	addToStage() {
		const source = addAudioLabSourceToStage(this.state, this.readConfiguration());
		this.changed(`${source.name} added to the active scene.`);
		this.setStatus(`${source.name} is ready on Stage.`);
	}

	readConfiguration() {
		return {
			preset: audioLabPresetById(this.dom.audioLabPreset.value),
			density: Number(this.dom.audioLabDensity.value) / 100,
			sensitivity: Number(this.dom.audioLabSensitivity.value),
			flow: Number(this.dom.audioLabFlow.value),
			text: this.dom.audioLabText.value
		};
	}

	updateReadouts() {
		this.dom.audioLabDensityValue.value = `${this.dom.audioLabDensity.value}%`;
		this.dom.audioLabSensitivityValue.value = Number(this.dom.audioLabSensitivity.value).toFixed(2);
		this.dom.audioLabFlowValue.value = Number(this.dom.audioLabFlow.value).toFixed(2);
	}
}
