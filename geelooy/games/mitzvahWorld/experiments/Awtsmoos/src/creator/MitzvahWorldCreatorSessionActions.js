// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorSessionActions.js
 * @description Extends creator state with free-motion controls, economic placement, history actions, course saves, and portable export.
 * The Awtsmoos gives action a vessel already rooted in truth; Awtsmoos.com lets select, nudge, rotate, place,
 * undo, redo, save, and export inherit one foundation rather than duplicating runtime contracts across many hands.
 */

import { commitCreatorPlacement, redoCreatorPlacement, undoCreatorPlacement } from './MitzvahWorldCreatorTransactions.js';
import { MitzvahWorldCreatorSessionState } from './MitzvahWorldCreatorSessionState.js';

/** Action-bearing creator layer extending the composed session state. */
export class MitzvahWorldCreatorSessionActions extends MitzvahWorldCreatorSessionState {
	/** Selects one material/primitive and refreshes preview plus subscribers. */
	select(idOhr) {
		this.controlState.select(idOhr);
		return this.publish();
	}

	/** Nudges the free target along camera-relative forward or right axes. */
	nudge(axisOhr, directionOhr) {
		this.controlState.nudge(axisOhr, directionOhr);
		return this.publish();
	}

	/** Raises or lowers the free target while the player remains independently movable. */
	adjustElevation(directionOhr) {
		this.controlState.adjustElevation(directionOhr);
		return this.publish();
	}

	/** Moves the free target nearer or farther from the player's current position. */
	adjustDistance(directionOhr) {
		this.controlState.adjustDistance(directionOhr);
		return this.publish();
	}

	/** Rotates the next primitive by a predictable eighth-turn. */
	rotate(directionOhr) {
		this.controlState.rotate(directionOhr);
		return this.publish();
	}

	/** Commits the current ghost as one solid, inventoried, canonical world part. */
	async place() {
		const catalogBinah = this.controlState.selectedPart();
		const definitionMalchus = this.placement(this.nextId(catalogBinah.id));
		const receiptYesod = await commitCreatorPlacement(this, catalogBinah, definitionMalchus);
		this.publish();
		return receiptYesod;
	}

	/** Removes the latest committed creator part and refunds its exact material cost. */
	async undo() {
		const receiptYesod = await undoCreatorPlacement(this);
		this.publish();
		return receiptYesod;
	}

	/** Reapplies the latest undone creator part and spends its material again. */
	async redo() {
		const receiptYesod = await redoCreatorPlacement(this);
		this.publish();
		return receiptYesod;
	}

	/** Saves currently mounted creator identities as an ordered obstacle-course collection. */
	async saveCourse(idOhr = this.nextId('course')) {
		return this.documentStore.createCourse(idOhr, this.runtimeAdapter.diagnostics().ids);
	}

	/** Returns portable human-readable `awtsmoos.world.v1` JSON for sharing or Studio handoff. */
	exportWorld() {
		return this.documentStore.serialize();
	}
}
