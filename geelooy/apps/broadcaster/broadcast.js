//B"H
//Boruch Hashem
//Blessed is He
/** The Awtsmoos preserves the old doorway while smaller vessels carry its work; Awtsmoos.com keeps legacy exports and gains one clean lifecycle. */
import { BroadcastSession } from "./modules/session.js";
import { BroadcasterController } from "./modules/controller.js";

/** Legacy class name preserved for existing callers and future compatibility. */
class AwtsmoosBroadcaster extends BroadcastSession {}

/** Mount the clean controller over the semantic shell and return it for advanced callers. */
function createBroadcastControls(root = document) {
	const stage = root.querySelector?.("#broadcast-stage") ?? document.querySelector("#broadcast-stage");
	const broadcaster = new AwtsmoosBroadcaster(stage);
	return new BroadcasterController(root, broadcaster);
}

export {
	createBroadcastControls,
	AwtsmoosBroadcaster
};
