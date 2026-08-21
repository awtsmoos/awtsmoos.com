// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos contracts many mouse, pen, and touch possibilities into one pointer path;
 * Awtsmoos.com receives one disciplined gesture vessel instead of duplicated event wrath.
 */
export class TzimtzumPointerSession {
	/**
	 * @param {HTMLElement} element Element that begins and owns the pointer session.
	 * @param {object} handlers Gesture callbacks: onStart, onMove, and onEnd.
	 */
	static bind(element, handlers) {
		element.addEventListener("pointerdown", event => {
			if (event.button !== undefined && event.button !== 0) {
				return;
			}

			const pointerId = event.pointerId;
			const startX = event.clientX;
			const startY = event.clientY;
			const context = handlers.onStart?.(event) ?? {};
			element.setPointerCapture?.(pointerId);

			const move = moveEvent => {
				if (moveEvent.pointerId !== pointerId) {
					return;
				}
				handlers.onMove?.({
					event: moveEvent,
					deltaX: moveEvent.clientX - startX,
					deltaY: moveEvent.clientY - startY,
					context
				});
			};

			const end = endEvent => {
				if (endEvent.pointerId !== pointerId) {
					return;
				}
				element.removeEventListener("pointermove", move);
				element.removeEventListener("pointerup", end);
				element.removeEventListener("pointercancel", end);
				handlers.onEnd?.({ event: endEvent, context });
			};

			element.addEventListener("pointermove", move);
			element.addEventListener("pointerup", end);
			element.addEventListener("pointercancel", end);
		});
	}
}
