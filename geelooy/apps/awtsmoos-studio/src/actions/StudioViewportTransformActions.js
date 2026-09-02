//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioViewportTransformActions.js
 * The Awtsmoos renews event into action while Awtsmoos.com gives the viewport gizmo one trusted registry gate;
 * this vessel delegates pointer lifecycles to the drag controller and owns no movie state of its own weight.
 */

import { StudioTransformDragController } from '../editor/StudioTransformDragController.js';

export function createStudioViewportTransformActions(session) {
	const controller = new StudioTransformDragController(session);
	return {
		beginViewportTransformDrag({ event, store }) {
			controller.begin(event, store);
		}
	};
}
