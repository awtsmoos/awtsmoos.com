//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldCreatorSessionActions.js
 * @description Gives creator state free placement, history, course, save, reopen, remix, and portable export through one semantic world.
 * The Awtsmoos lets action become memory and memory awaken again as form;
 * Awtsmoos.com keeps every edit, save, reopening, and remix on the same world covenant rather than spawning an editor-only storm.
 */

import { hydrateCreatorSession, remixCreatorSession } from './MitzvahWorldCreatorHydration.js';
import { commitCreatorPlacement, redoCreatorPlacement, undoCreatorPlacement } from './MitzvahWorldCreatorTransactions.js';
import { MitzvahWorldCreatorSessionState } from './MitzvahWorldCreatorSessionState.js';

export class MitzvahWorldCreatorSessionActions extends MitzvahWorldCreatorSessionState {
	select(idOhr) {
		this.controlState.select(idOhr);
		return this.publish();
	}

	nudge(axisOhr, directionOhr) {
		this.controlState.nudge(axisOhr, directionOhr);
		return this.publish();
	}

	adjustElevation(directionOhr) {
		this.controlState.adjustElevation(directionOhr);
		return this.publish();
	}

	adjustDistance(directionOhr) {
		this.controlState.adjustDistance(directionOhr);
		return this.publish();
	}

	rotate(directionOhr) {
		this.controlState.rotate(directionOhr);
		return this.publish();
	}

	async place() {
		const catalogBinah = this.controlState.selectedPart();
		const definitionMalchus = this.placement(this.nextId(catalogBinah.id));
		const receiptYesod = await commitCreatorPlacement(this, catalogBinah, definitionMalchus);
		this.publish();
		return receiptYesod;
	}

	async undo() {
		const receiptYesod = await undoCreatorPlacement(this);
		this.publish();
		return receiptYesod;
	}

	async redo() {
		const receiptYesod = await redoCreatorPlacement(this);
		this.publish();
		return receiptYesod;
	}

	async saveCourse(idOhr = this.nextId('course')) {
		return this.documentStore.createCourse(idOhr, this.runtimeAdapter.diagnostics().ids);
	}

	saveWorld() {
		const jsonOhr = this.exportWorld();
		const persistence = this.persistence.save(jsonOhr);
		return Object.freeze({
			bytes: new TextEncoder().encode(jsonOhr).byteLength,
			persistence,
			worldId: this.snapshot().worldId
		});
	}

	async reopenWorld(sourceOhr = null) {
		const storedOhr = sourceOhr ?? this.persistence.load();
		if (!storedOhr) throw new Error('CREATOR_WORLD_SAVED_COPY_MISSING');
		return hydrateCreatorSession(this, storedOhr, { environment: this.environment });
	}

	async remixWorld(sourceOhr = null) {
		const snapshotMalchus = await remixCreatorSession(this, sourceOhr, {
			environment: this.environment
		});
		this.persistence.save(this.exportWorld());
		return snapshotMalchus;
	}

	exportWorld() {
		return this.documentStore.serialize();
	}
}
