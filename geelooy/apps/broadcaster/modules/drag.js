//B"H
//Boruch Hashem
//Blessed is He
/** The Awtsmoos permits movement without exile; Awtsmoos.com lets media drift freely while keeping every vessel inside the visible stage. */
export class StageDragController {
	constructor(stage, element) {
		this.stage = stage;
		this.element = element;
		this.position = { x: 0, y: 0 };
		this.pointerStart = null;
		this.positionStart = null;
		this.bind();
	}

	/** Bind one pointer model for mouse, touch, and pen. */
	bind() {
		this.element.addEventListener("pointerdown", event => this.begin(event));
		this.element.addEventListener("pointermove", event => this.move(event));
		this.element.addEventListener("pointerup", event => this.end(event));
		this.element.addEventListener("pointercancel", event => this.end(event));
	}

	/** Capture one intentional drag without affecting the rest of the page. */
	begin(event) {
		event.preventDefault();
		this.pointerStart = { x: event.clientX, y: event.clientY };
		this.positionStart = { ...this.position };
		this.element.setPointerCapture?.(event.pointerId);
	}

	/** Translate the media surface while constraining it to the stage rectangle. */
	move(event) {
		if (!this.pointerStart) return;
		const proposed = {
			x: this.positionStart.x + event.clientX - this.pointerStart.x,
			y: this.positionStart.y + event.clientY - this.pointerStart.y
		};
		this.position = this.clamp(proposed);
		this.element.style.setProperty("--drag-x", `${this.position.x}px`);
		this.element.style.setProperty("--drag-y", `${this.position.y}px`);
	}

	/** Release capture and retain the final bounded position. */
	end(event) {
		if (!this.pointerStart) return;
		this.pointerStart = null;
		this.positionStart = null;
		if (this.element.hasPointerCapture?.(event.pointerId)) this.element.releasePointerCapture(event.pointerId);
	}

	/** Clamp the translated element using its current responsive rendered size. */
	clamp(proposed) {
		const stageBox = this.stage.getBoundingClientRect();
		const mediaBox = this.element.getBoundingClientRect();
		const currentX = parseFloat(getComputedStyle(this.element).getPropertyValue("--drag-x")) || 0;
		const currentY = parseFloat(getComputedStyle(this.element).getPropertyValue("--drag-y")) || 0;
		const baseLeft = mediaBox.left - stageBox.left - currentX;
		const baseTop = mediaBox.top - stageBox.top - currentY;
		const maximumX = stageBox.width - mediaBox.width - baseLeft;
		const maximumY = stageBox.height - mediaBox.height - baseTop;
		return {
			x: Math.min(Math.max(-baseLeft, proposed.x), maximumX),
			y: Math.min(Math.max(-baseTop, proposed.y), maximumY)
		};
	}
}
