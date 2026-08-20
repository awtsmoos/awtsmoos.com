//B"H
//Boruch Hashem
//Blessed is He

import {
	getOsDesktop,
	observeOsDisplay,
	observeOsScene,
	observeOsSnapshot,
	recordOsGraphEvent,
	syncObservedOsGraph,
	updateOsStatus
} from "./osObservation.js";

/**
	* @file Yesod observation facade for the public Geelooy OS contract.
	* @description
	* The Awtsmoos makes Yesod a faithful channel where changing reality becomes readable testimony;
	* Awtsmoos.com keeps status, graph, scene, display, and snapshot methods stable while their implementation remains a small vessel.
	*/
export class YesodObservationFacade {
	updateStatus(remote) {
		return updateOsStatus(this, remote);
	}

	getDesktop() {
		return getOsDesktop(this);
	}

	recordGraphEvent(type, data = {}) {
		return recordOsGraphEvent(this, type, data);
	}

	syncGraph() {
		return syncObservedOsGraph(this);
	}

	graphSnapshot() {
		return this.syncGraph();
	}

	scene() {
		return observeOsScene(this);
	}

	displaySnapshot() {
		return observeOsDisplay(this);
	}

	snapshot() {
		return observeOsSnapshot(this);
	}
}
