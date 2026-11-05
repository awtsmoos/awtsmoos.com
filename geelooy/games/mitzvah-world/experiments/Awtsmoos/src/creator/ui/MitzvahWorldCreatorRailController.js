//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldCreatorRailController.js
 * @description Coordinates creator chrome, placement/history, sharing, and delegates persistent-world operations to their own guarded vessel.
 * The Awtsmoos joins visible choice and hidden deed without confusing their vessels; Awtsmoos.com lets view, session, physics,
 * inventory, document, persistence, and sharing each preserve a gate while the builder experiences one clear rail of living revelations.
 */

import { createCreatorRailActionMap } from './MitzvahWorldCreatorRailActionMap.js';
import { MitzvahWorldCreatorWorldActionController } from './MitzvahWorldCreatorWorldActionController.js';

export class MitzvahWorldCreatorRailController {
	constructor(sessionTiferes, viewMalchus, sharingYesod) {
		this.session = sessionTiferes;
		this.view = viewMalchus;
		this.sharing = sharingYesod;
		this.collapsed = false;
		this.worldActions = new MitzvahWorldCreatorWorldActionController(
			sessionTiferes,
			viewMalchus,
			(...oros) => this.mutate(...oros)
		);
		this.actions = createCreatorRailActionMap(sessionTiferes, this);
		this.unsubscribe = sessionTiferes.subscribe(snapshotBinah => viewMalchus.render(snapshotBinah));
	}

	open() {
		this.view.setOpen(true);
		this.view.status('Creator live · movement remains active.');
		return this;
	}

	close() {
		this.view.setOpen(false);
		return this;
	}

	toggleCollapsed() {
		this.collapsed = !this.collapsed;
		this.view.setCollapsed(this.collapsed);
		return this.collapsed;
	}

	select(idOhr) {
		return this.session.select(idOhr);
	}

	perform(actionOhr) {
		const actionDaas = this.actions[actionOhr];
		if (!actionDaas) {
			this.view.status(`Unknown creator action: ${actionOhr}.`);
			return null;
		}
		return actionDaas();
	}

	place() {
		return this.mutate('Placing…', 'Part placed.', () => this.session.place());
	}

	undo() {
		return this.mutate('Undoing…', 'Placement undone.', () => this.session.undo());
	}

	redo() {
		return this.mutate('Redoing…', 'Placement restored.', () => this.session.redo());
	}

	saveCourse() {
		return this.mutate('Saving course…', 'Obstacle course saved.', () => this.session.saveCourse());
	}

	share() {
		return this.mutate('Preparing world…', 'World ready to share.', () => this.sharing.share(this.session.exportWorld()));
	}

	saveWorld() {
		return this.worldActions.save();
	}

	restoreWorld() {
		return this.worldActions.restore();
	}

	remixWorld() {
		return this.worldActions.remix();
	}

	async mutate(pendingOhr, successOhr, mutationDaas) {
		this.view.setBusy(true);
		this.view.status(pendingOhr);
		try {
			const receiptMalchus = await mutationDaas();
			this.view.status(receiptMalchus ? successOhr : 'Nothing to change.');
			return receiptMalchus;
		} catch (errorOhr) {
			this.view.status(humanizeCreatorError(errorOhr));
			return null;
		} finally {
			this.view.setBusy(false);
			this.view.render(this.session.snapshot());
		}
	}

	destroy() {
		this.unsubscribe?.();
	}
}

function humanizeCreatorError(errorOhr) {
	return String(errorOhr?.message || errorOhr)
		.replaceAll('_', ' ')
		.replaceAll(':', ': ')
		.toLowerCase();
}
