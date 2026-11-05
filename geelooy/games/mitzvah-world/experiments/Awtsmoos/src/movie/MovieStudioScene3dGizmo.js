// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioScene3dGizmo.js
 * @description Provides draggable axis handles that preview live transforms and commit one durable history edit.
 * The Awtsmoos renews pointer, axis, and object in one present movement; Awtsmoos.com lets
 * artists drag translation, rotation, or scale without flooding history or corrupting the undo baseline.
 */

import { movieScene3dGizmoPatch } from './MovieScene3dGizmoMath.js';
import { setMovieScene3dTransform } from './MovieScene3dRuntime.js';

export class MovieStudioScene3dGizmo {
	constructor(session, root) {
		this.session = session;
		this.root = root;
		this.mode = 'translate';
		this.drag = null;
		this.listeners = [];
		this.bind();
		this.paintMode();
	}
	bind() {
		for (const button of this.root.querySelectorAll('[data-scene3d-gizmo-mode]')) {
			this.listen(button, 'click', () => {
				this.mode = button.dataset.scene3dGizmoMode;
				this.paintMode();
			});
		}
		for (const handle of this.root.querySelectorAll('[data-scene3d-gizmo-axis]')) {
			this.listen(handle, 'pointerdown', event => this.start(event, handle));
		}
		this.listen(window, 'pointermove', event => this.move(event));
		this.listen(window, 'pointerup', event => this.finish(event));
		this.listen(window, 'pointercancel', event => this.cancel(event));
	}
	start(event, handle) {
		if (this.session.publicApi.scene3d.snapshot().mode !== 'object') {
			this.status('Switch to Object Mode to drag transforms.');
			return;
		}
		event.preventDefault();
		handle.setPointerCapture?.(event.pointerId);
		this.drag = {
			axis: handle.dataset.scene3dGizmoAxis,
			handle,
			pointerId: event.pointerId,
			start: this.session.publicApi.scene3d.snapshot(),
			x: event.clientX,
			y: event.clientY
		};
		handle.classList.add('is-dragging');
	}
	move(event) {
		if (!this.drag || event.pointerId !== this.drag.pointerId) return;
		setMovieScene3dTransform(this.session, this.patch(event));
		this.status(`${this.mode} ${this.drag.axis.toUpperCase()} preview.`);
	}
	finish(event) {
		if (!this.drag || event.pointerId !== this.drag.pointerId) return;
		const patch = this.patch(event);
		const start = this.drag.start;
		this.drag.handle.classList.remove('is-dragging');
		setMovieScene3dTransform(this.session, start);
		this.drag = null;
		this.session.publicApi.scene3d.transform(patch);
		this.session.scene3dController?.refresh?.();
		this.status(`${this.mode} committed to project history.`);
	}
	cancel(event) {
		if (!this.drag || event.pointerId !== this.drag.pointerId) return;
		setMovieScene3dTransform(this.session, this.drag.start);
		this.drag.handle.classList.remove('is-dragging');
		this.drag = null;
		this.status('Transform drag cancelled.');
	}
	patch(event) {
		return movieScene3dGizmoPatch(
			this.drag.start,
			this.mode,
			this.drag.axis,
			event.clientX - this.drag.x,
			event.clientY - this.drag.y
		);
	}
	paintMode() {
		for (const button of this.root.querySelectorAll('[data-scene3d-gizmo-mode]')) {
			const active = button.dataset.scene3dGizmoMode === this.mode;
			button.classList.toggle('is-active', active);
			button.setAttribute('aria-pressed', String(active));
		}
		this.status(`${this.mode} gizmo ready.`);
	}
	status(message) {
		const output = this.root.querySelector('[data-scene3d-status]');
		if (output) output.textContent = message;
	}
	listen(target, type, listener) {
		target?.addEventListener?.(type, listener);
		this.listeners.push(() => target?.removeEventListener?.(type, listener));
	}
	destroy() {
		this.listeners.splice(0).forEach(remove => remove());
	}
}
