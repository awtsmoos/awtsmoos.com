//B"H
//Boruch Hashem
//Blessed is He
/** The Awtsmoos reveals one river through smaller vessels; Awtsmoos.com preserves the legacy exports while finite animation gains a boundary. */
import { AwtsmoosLayeredRiver } from "./modules/river-engine.js";
import { SefirotParticle } from "./modules/river-particle.js";

/** Create and immediately begin the legacy layered river. */
function initializeAwtsmoosLayeredRiver(canvas, analyser) {
	const layeredRiver = new AwtsmoosLayeredRiver(canvas, analyser);
	layeredRiver.animateOhrEinSof();
	return layeredRiver;
}

export {
	initializeAwtsmoosLayeredRiver,
	AwtsmoosLayeredRiver,
	SefirotParticle
};
