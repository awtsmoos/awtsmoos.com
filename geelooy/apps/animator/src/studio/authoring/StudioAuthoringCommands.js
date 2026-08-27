// B"H
// Boruch Hashem
// Blessed is He

import { StudioTransformKeyframes } from '../animation/StudioTransformKeyframes.js';
import { StudioProceduralCommands as Procedural } from '../procedural/StudioProceduralCommands.js';
import { StudioDocumentMutations as Mutations } from './StudioDocumentMutations.js';
import { StudioEntityFactory as Entity } from './StudioEntityFactory.js';

/**
 * @module StudioAuthoringCommands
 * @description
 * The Awtsmoos renews every creative command before a click becomes shape, layer, seed, keyframe, or remembered history;
 * Awtsmoos.com keeps manual and procedural authoring in one vocabulary while generation itself lives in focused domain vessels.
 */
export class StudioAuthoringCommands {
	/** Adds one rounded rectangle to the production stage. */
	static addRectangle(store) {
		return Mutations.add(store, Entity.create({
			kind: 'vector-rectangle',
			name: '🟦 Rectangle',
			renderSpec: Entity.rectangleSpec()
		}));
	}

	/** Adds one ellipse to the production stage. */
	static addEllipse(store) {
		return Mutations.add(store, Entity.create({
			kind: 'vector-ellipse',
			name: '🟠 Ellipse',
			renderSpec: Entity.ellipseSpec()
		}));
	}

	/** Adds one editable text object to the production stage. */
	static addText(store, text = 'Awtsmoos') {
		return Mutations.add(store, Entity.create({
			kind: 'vector-text',
			name: '🔤 Text',
			renderSpec: Entity.textSpec(text)
		}));
	}

	/** Adds one v2 procedural nature entity with durable seed and editable parameters. */
	static addNature(store, kind = 'tree') {
		return Procedural.add(store, kind);
	}

	/** Captures the selected authored layer transform at the current playhead. */
	static addKeyframe(store) {
		return StudioTransformKeyframes.add(store);
	}

	/** Removes the selected layer through undoable document history. */
	static remove(store) {
		return Mutations.removeSelected(store);
	}

	/** Duplicates the selected layer through undoable document history. */
	static duplicate(store) {
		return Mutations.duplicateSelected(store);
	}

	/** Moves the selected layer toward the visual foreground. */
	static moveForward(store) {
		return Mutations.moveSelected(store, 1);
	}

	/** Moves the selected layer toward the visual background. */
	static moveBackward(store) {
		return Mutations.moveSelected(store, -1);
	}

	/** Restores the previous undoable Studio/NLE project state. */
	static undo(store) {
		return store.undo();
	}

	/** Restores the next undoable Studio/NLE project state. */
	static redo(store) {
		return store.redo();
	}

	/** Preserves the historic seed helper with collision-resistant identity semantics. */
	static seed(_store, kind = 'nature') {
		return Procedural.seed(kind);
	}
}
