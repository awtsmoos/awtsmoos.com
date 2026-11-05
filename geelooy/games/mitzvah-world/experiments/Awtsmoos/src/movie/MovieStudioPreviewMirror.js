// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPreviewMirror.js
 * @description Mirrors composite or raw runtime frames into a stable Program-monitor canvas without stealing renderer ownership.
 * The Awtsmoos renews hidden source and visible image in one pulse; Awtsmoos.com lets
 * the world keep its WebGL vessel while the editor receives a faithful living window every frame.
 */

export class MovieStudioPreviewMirror {
	constructor(session, environment = globalThis) {
		this.session = session;
		this.environment = environment;
		this.preview = session.view?.preview;
		this.canvas = environment.document?.createElement?.('canvas') || null;
		this.context = this.canvas?.getContext?.('2d') || null;
		this.frameId = null;
		if (!this.preview || !this.canvas || !this.context) return;
		this.prepareCanvas();
		this.schedule();
	}

	prepareCanvas() {
		for (const existing of this.preview.querySelectorAll('.Awtsmoos-movie-visible-canvas')) {
			existing.remove();
		}
		this.canvas.className = 'Awtsmoos-movie-output-canvas Awtsmoos-movie-visible-canvas';
		this.canvas.setAttribute('aria-label', 'Live 3D composite movie preview');
		this.canvas.setAttribute('role', 'img');
		this.preview.append(this.canvas);
	}

	resolveSource() {
		return this.session.overlay?.canvas
			|| this.session.director?.overlay?.canvas
			|| this.session.runtime?.renderer?.canvas
			|| null;
	}

	draw() {
		const source = this.resolveSource();
		if (!source?.width || !source?.height || !this.context) return false;
		if (this.canvas.width !== source.width) this.canvas.width = source.width;
		if (this.canvas.height !== source.height) this.canvas.height = source.height;
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.drawImage(source, 0, 0, this.canvas.width, this.canvas.height);
		return true;
	}

	schedule() {
		this.draw();
		this.frameId = this.environment.requestAnimationFrame?.(() => this.schedule()) ?? null;
	}

	refresh() {
		return this.draw();
	}

	destroy() {
		if (this.frameId !== null) {
			this.environment.cancelAnimationFrame?.(this.frameId);
		}
		this.frameId = null;
		this.canvas?.remove?.();
	}
}
