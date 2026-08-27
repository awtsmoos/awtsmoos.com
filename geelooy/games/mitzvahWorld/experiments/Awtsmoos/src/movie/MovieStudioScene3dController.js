// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioScene3dController.js
 * @description Connects the scene3d API to object/edit mode, transforms, meshes, and vertices.
 * The Awtsmoos renews hand and script through one movement law; Awtsmoos.com lets
 * every typed coordinate and raw vertex delta pass through the same stable public domain.
 */

export class MovieStudioScene3dController {
	constructor(session, root) {
		this.session = session;
		this.api = session.publicApi.scene3d;
		this.view = collectScene3dView(root);
		this.listeners = [];
		this.bind();
		this.refreshProject();
	}
	bind() {
		this.listen(this.view.model, 'change', () => this.run(() => {
			this.api.selectModel(this.view.model.value);
			this.refresh();
		}));
		this.listen(this.view.mode, 'change', () => this.run(() => {
			this.api.mode(this.view.mode.value);
			this.refresh();
		}));
		this.listen(this.view.mesh, 'change', () => this.run(() => {
			this.api.selectMesh(this.view.mesh.value);
			this.refresh();
		}));
		this.listen(this.view.apply, 'click', () => this.run(() => this.applyTransform()));
		this.listen(this.view.read, 'click', () => this.run(() => this.readVertices()));
		this.listen(this.view.move, 'click', () => this.run(() => this.moveVertices()));
	}
	refreshProject() {
		this.session.scene3dState = null;
		this.refreshModels();
		if (this.api.catalog().models.length) this.refresh();
		else this.status('No authored 3D models in this project.');
	}
	refreshModels() {
		const catalog = this.api.catalog();
		this.view.model.replaceChildren(...catalog.models.map(model => {
			const option = document.createElement('option');
			option.value = model.id;
			option.textContent = model.id;
			return option;
		}));
	}
	refresh() {
		const snapshot = this.api.snapshot();
		this.view.model.value = snapshot.modelId || '';
		this.view.mode.value = snapshot.mode;
		this.view.mesh.value = String(snapshot.meshIndex);
		this.view.vertices.value = snapshot.vertexIndices.join(',');
		writeVector(this.view, 'position', snapshot.position);
		writeVector(this.view, 'rotation', snapshot.rotation);
		writeVector(this.view, 'scale', snapshot.scale);
		this.view.output.value = JSON.stringify(snapshot, null, 2);
		this.status(`${snapshot.mode} mode · ${snapshot.meshCount} meshes.`);
	}
	applyTransform() {
		const result = this.api.transform({
			position: readVector(this.view, 'position'),
			rotation: readVector(this.view, 'rotation'),
			scale: readVector(this.view, 'scale')
		});
		this.view.output.value = JSON.stringify(result, null, 2);
		this.status('Object transform applied to the live 3D target.');
	}
	readVertices() {
		this.api.selectVertices(readIndices(this.view.vertices.value));
		const result = this.api.vertices({ count: 256, meshIndex: Number(this.view.mesh.value) });
		this.view.output.value = JSON.stringify(result, null, 2);
		this.status(`Read ${result.vertices.length} of ${result.count} vertices.`);
	}
	moveVertices() {
		const indices = readIndices(this.view.vertices.value);
		this.api.mode('edit');
		this.api.selectVertices(indices);
		const result = this.api.moveVertices(indices, readVector(this.view, 'delta'));
		this.view.mode.value = 'edit';
		this.view.output.value = JSON.stringify(result, null, 2);
		this.status(`Moved ${indices.length} raw vertices.`);
	}
	async run(action) {
		try { return await action(); }
		catch (error) { this.status(`3D edit failed: ${error.message}`); return null; }
	}
	status(message) { if (this.view.status) this.view.status.textContent = message; }
	listen(target, type, listener) {
		target?.addEventListener?.(type, listener);
		this.listeners.push(() => target?.removeEventListener?.(type, listener));
	}
	destroy() { this.listeners.splice(0).forEach(remove => remove()); }
}

function collectScene3dView(root) {
	const find = name => root.querySelector(`[data-scene3d-${name}]`);
	return { apply: find('apply-transform'), mesh: find('mesh'), mode: find('mode'), model: find('model'), move: find('move-vertices'), output: find('output'), read: find('read-vertices'), status: find('status'), vertices: find('vertices'), root };
}
function readVector(view, prefix) { return ['x', 'y', 'z'].map(axis => Number(view.root.querySelector(`[data-scene3d-${prefix}-${axis}]`)?.value || 0)); }
function writeVector(view, prefix, values) { ['x', 'y', 'z'].forEach((axis, index) => { view.root.querySelector(`[data-scene3d-${prefix}-${axis}]`).value = String(values[index]); }); }
function readIndices(value) { return [...new Set(String(value).split(',').map(item => Math.max(0, Math.floor(Number(item.trim()) || 0))))]; }
