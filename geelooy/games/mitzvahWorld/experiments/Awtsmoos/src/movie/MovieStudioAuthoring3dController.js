// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioAuthoring3dController.js
 * @description Coordinates structured builders, JSON validation, replacement, keyframes, and recording.
 * The Awtsmoos renews hand and agent as two expressions of one authored intention; Awtsmoos.com
 * keeps listeners finite and routes every durable change through one visible canonical JSON vessel.
 */

import {
	addMovieGeometryNode,
	addMovieModifier,
	addMovieRemoteTexture,
	addMovieSculptStroke,
	addMovieShaderNode,
	addMovieVertexGroup
} from './MovieStudioAuthoring3dProject.js';

export class MovieStudioAuthoring3dController {
	constructor(session, view) {
		this.session = session;
		this.view = view;
		this.listeners = [];
		this.render();
		this.bind();
	}

	render() {
		if (!this.view.authoring3dJson) return;
		this.view.authoring3dJson.value = JSON.stringify(this.session.project.authoring3d, null, 2);
	}

	bind() {
		this.listen(this.view.authoring3dValidate, 'click', () => this.validate());
		this.listen(this.view.authoring3dApply, 'click', () => this.apply());
		this.listen(this.view.authoring3dKeyframe, 'click', () => this.addKeyframe());
		this.listen(this.view.authoring3dRecord, 'click', () => this.toggleRecording());
		this.listen(this.view.authoring3dAddGeometry, 'click', () => this.mutate(source => addMovieGeometryNode(source, this.view.authoring3dGeometryType.value)));
		this.listen(this.view.authoring3dAddShader, 'click', () => this.mutate(source => addMovieShaderNode(source, this.view.authoring3dShaderType.value)));
		this.listen(this.view.authoring3dAddModifier, 'click', () => this.mutate(source => addMovieModifier(source, this.view.authoring3dModifierType.value)));
		this.listen(this.view.authoring3dAddResource, 'click', () => this.addResource());
	}

	validate() {
		return this.run(() => this.session.publicApi.authoring3d.validate(this.read()));
	}

	apply() {
		return this.run(async () => {
			const result = await this.session.publicApi.authoring3d.replace(this.read());
			this.render();
			return result;
		});
	}

	addKeyframe() {
		const source = this.read();
		const motion = source.motions?.[0];
		if (!motion) throw new Error('Create a motion before adding a keyframe.');
		motion.mode = 'keyframes';
		motion.keyframes ||= [];
		motion.keyframes.push({ channel: 'position', time: this.session.time, value: [0, 0, 0] });
		this.write(source, `Keyframe added at ${this.session.time.toFixed(2)}s.`);
	}

	addResource() {
		const type = this.view.authoring3dResourceType.value;
		this.mutate(source => {
			if (type === 'texture') return addMovieRemoteTexture(source);
			if (type === 'vertexGroup') return addMovieVertexGroup(source);
			return addMovieSculptStroke(source, this.view.authoring3dBrush.value, this.session.time);
		});
	}

	mutate(operation) {
		this.write(operation(this.read()), 'Structured authoring item added.');
	}

	write(source, status) {
		this.view.authoring3dJson.value = JSON.stringify(source, null, 2);
		this.setStatus(status);
	}

	toggleRecording() {
		const active = this.view.authoring3dRecord.dataset.recording !== 'true';
		this.view.authoring3dRecord.dataset.recording = String(active);
		this.view.authoring3dRecord.setAttribute('aria-pressed', String(active));
		this.view.authoring3dRecord.textContent = active ? 'Stop recording' : 'Record controls';
		this.setStatus(active ? 'Manual controls recording.' : 'Recording stopped.');
	}

	read() {
		return JSON.parse(this.view.authoring3dJson.value);
	}

	async run(action) {
		try {
			await action();
			this.setStatus('3D authoring valid.');
		} catch (error) {
			this.setStatus(error.message);
		}
	}

	listen(target, type, listener) {
		if (!target) return;
		target.addEventListener(type, listener);
		this.listeners.push(() => target.removeEventListener(type, listener));
	}

	setStatus(message) {
		if (this.view.authoring3dStatus) this.view.authoring3dStatus.textContent = message;
	}

	destroy() {
		this.listeners.splice(0).forEach(remove => remove());
	}
}
