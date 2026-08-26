// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioCanvas.js
 * @description Provides a fast renderer-neutral top-down authoring plane with selection and snapped dragging.
 * The Awtsmoos renews every point before a pixel can hint at place;
 * Awtsmoos.com lets this canvas author worlds without importing Three.js or the game renderer into its space.
 */

const PIXELS_PER_UNIT = 34;

export class StudioCanvas {
	constructor(host, state) {
		this.host = host;
		this.state = state;
		this.draggingId = null;
		this.canvas = document.createElement('canvas');
		this.canvas.className = 'studio-canvas';
		this.canvas.tabIndex = 0;
		this.canvas.setAttribute('aria-label', 'Top-down Mitzvah World editor');
		this.host.append(this.canvas);
		this.context = this.canvas.getContext('2d');
		this.bind();
		this.resize();
	}

	render(snapshot) {
		this.snapshot = snapshot;
		this.resize();
		const { width, height } = this.canvas;
		this.context.clearRect(0, 0, width, height);
		this.drawGrid(width, height, snapshot.grid);
		for (const object of snapshot.document.objects) {
			this.drawObject(object, object.id === snapshot.selectedId);
		}
	}

	bind() {
		this.canvas.addEventListener('pointerdown', event => this.beginDrag(event));
		this.canvas.addEventListener('pointermove', event => this.drag(event));
		this.canvas.addEventListener('pointerup', () => this.endDrag());
		this.canvas.addEventListener('pointercancel', () => this.endDrag());
		new ResizeObserver(() => this.render(this.snapshot || this.state.snapshot())).observe(this.host);
	}

	resize() {
		const bounds = this.host.getBoundingClientRect();
		const ratio = Math.min(2, globalThis.devicePixelRatio || 1);
		const width = Math.max(320, Math.round(bounds.width * ratio));
		const height = Math.max(360, Math.round(bounds.height * ratio));
		if (this.canvas.width === width && this.canvas.height === height) return;
		this.canvas.width = width;
		this.canvas.height = height;
		this.canvas.style.width = `${width / ratio}px`;
		this.canvas.style.height = `${height / ratio}px`;
		this.ratio = ratio;
	}

	drawGrid(width, height, grid) {
		const step = Math.max(8, grid * PIXELS_PER_UNIT * this.ratio);
		this.context.strokeStyle = 'rgba(255,255,255,.07)';
		this.context.lineWidth = 1;
		for (let x = width / 2 % step; x < width; x += step) this.line(x, 0, x, height);
		for (let y = height / 2 % step; y < height; y += step) this.line(0, y, width, y);
		this.context.strokeStyle = 'rgba(255,255,255,.18)';
		this.line(width / 2, 0, width / 2, height);
		this.line(0, height / 2, width, height / 2);
	}

	drawObject(object, selected) {
		const point = this.worldToCanvas(object.position);
		const width = Math.max(18, object.scale.x * PIXELS_PER_UNIT * this.ratio);
		const depth = Math.max(18, object.scale.z * PIXELS_PER_UNIT * this.ratio);
		this.context.save();
		this.context.translate(point.x, point.y);
		this.context.rotate(-(object.rotation.y || 0));
		this.context.fillStyle = object.color;
		this.context.strokeStyle = selected ? '#ffffff' : 'rgba(255,255,255,.35)';
		this.context.lineWidth = selected ? 4 : 2;
		if (object.shape === 'sphere' || object.shape === 'cylinder') {
			this.context.beginPath();
			this.context.ellipse(0, 0, width / 2, depth / 2, 0, 0, Math.PI * 2);
			this.context.fill();
			this.context.stroke();
		} else {
			this.context.fillRect(-width / 2, -depth / 2, width, depth);
			this.context.strokeRect(-width / 2, -depth / 2, width, depth);
		}
		this.context.restore();
	}

	beginDrag(event) {
		const object = this.objectAt(event);
		this.draggingId = object?.id || null;
		this.state.select(this.draggingId);
		if (this.draggingId) this.canvas.setPointerCapture?.(event.pointerId);
	}

	drag(event) {
		if (!this.draggingId) return;
		this.state.move(this.draggingId, this.canvasToWorld(event));
	}

	endDrag() {
		this.draggingId = null;
	}

	objectAt(event) {
		const point = this.canvasToWorld(event);
		return [...(this.snapshot?.document.objects || [])].reverse().find(object => {
			return Math.abs(object.position.x - point.x) <= Math.max(0.5, object.scale.x / 2)
				&& Math.abs(object.position.z - point.z) <= Math.max(0.5, object.scale.z / 2);
		});
	}

	canvasToWorld(event) {
		const bounds = this.canvas.getBoundingClientRect();
		return {
			x: (event.clientX - bounds.left - bounds.width / 2) / PIXELS_PER_UNIT,
			z: (bounds.height / 2 - (event.clientY - bounds.top)) / PIXELS_PER_UNIT
		};
	}

	worldToCanvas(position) {
		return {
			x: this.canvas.width / 2 + position.x * PIXELS_PER_UNIT * this.ratio,
			y: this.canvas.height / 2 - position.z * PIXELS_PER_UNIT * this.ratio
		};
	}

	line(x1, y1, x2, y2) {
		this.context.beginPath();
		this.context.moveTo(x1, y1);
		this.context.lineTo(x2, y2);
		this.context.stroke();
	}
}
