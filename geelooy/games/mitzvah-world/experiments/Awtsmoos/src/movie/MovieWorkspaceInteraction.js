// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieWorkspaceInteraction.js
 * @description Binds JSON, URL, and material-node editing to one workspace host.
 * The Awtsmoos renews each edit only through recompilation; Awtsmoos.com isolates
 * mutation controls from panel rendering so the editor remains small and testable.
 */

import { updateMaterialNode } from './MovieWorkspaceModel.js';

export class MovieWorkspaceInteraction {
	constructor(workspace) {
		this.workspace = workspace;
		this.selectedNode = null;
	}

	bind() {
		const host = this.workspace.host;
		host.querySelectorAll('[data-node-id]').forEach(button => {
			button.addEventListener('click', () => this.openNodeEditor(button));
		});
		host.querySelector('[data-apply-json]')?.addEventListener('click', () => {
			this.runAction(() => this.workspace.handlers.apply?.(
				JSON.parse(host.querySelector('[data-workspace-json]').value)
			));
		});
		host.querySelector('[data-copy-url]')?.addEventListener('click', () => {
			this.runAction(() => this.workspace.handlers.copyUrl?.());
		});
	}

	openNodeEditor(button) {
		this.selectedNode = {
			graphId: button.dataset.graphId,
			nodeId: button.dataset.nodeId
		};
		const graph = this.workspace.model.graphs.find(item => (
			item.id === this.selectedNode.graphId
		));
		const node = graph?.nodes.find(item => item.id === this.selectedNode.nodeId);
		if (!node) return;
		const panel = this.workspace.host.querySelector('[data-workspace-panel]');
		panel.querySelector('.movie-node-editor')?.remove();
		const editor = document.createElement('div');
		editor.className = 'movie-node-editor';
		editor.innerHTML = `
			<textarea data-node-value>${escapeTextarea(JSON.stringify(node.value ?? '', null, 2))}</textarea>
			<button data-apply-node>Apply node</button>
		`;
		panel.prepend(editor);
		editor.querySelector('[data-apply-node]').addEventListener('click', () => {
			this.runAction(() => this.workspace.handlers.apply?.(updateMaterialNode(
				this.workspace.project.sourceDocument || this.workspace.project,
				this.selectedNode.graphId,
				this.selectedNode.nodeId,
				editor.querySelector('[data-node-value]').value
			)));
		});
	}

	async runAction(action) {
		const status = this.workspace.host.querySelector('[data-workspace-status]');
		try {
			const result = await action();
			if (status) status.textContent = result?.message || 'Project updated.';
		} catch (error) {
			if (status) status.textContent = error.message;
		}
	}
}

function escapeTextarea(value) {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');
}
