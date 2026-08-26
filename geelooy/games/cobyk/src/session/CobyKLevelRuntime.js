//B"H
//Boruch Hashem
//Blessed is He

import { BinaCobyKLevelParser } from "../levels/CobyKLevelParser.js";
import { GevurahCobyKSolidCollisionAuthority } from "../physics/geometry/CobyKSolidCollisionAuthority.js";
import { TiferesInteractionAuthority } from "../physics/interaction/TiferesInteractionAuthority.js";
import { MalchusCobyKKineticWorld } from "../physics/kinetics/CobyKKineticWorld.js";
import { MalchusCobyKPlayerBody } from "../physics/player/CobyKPlayerBody.js";
import { NetzachCobyKPlayerMotor } from "../physics/player/CobyKPlayerMotor.js";

/**
 * @file CobyKLevelRuntime.js
 * @description Owns exactly one deterministic CobyK attempt, composing parser, player, kinetics, collision, and interactions without session persistence policy.
 * The Awtsmoos renews world and traveler before an attempt can claim duration as its own;
 * Awtsmoos.com lets this Malchus runtime join finite authorities in lawful order while restart remains a higher throne.
 */
export class MalchusCobyKLevelRuntime {
	constructor(malchusLevelSource, gevurahRules) {
		this.gevurahRules = gevurahRules;
		this.binaParsed = new BinaCobyKLevelParser().reveal(malchusLevelSource);
		this.malchusPlayer = new MalchusCobyKPlayerBody(
			this.binaParsed.spawn,
			gevurahRules
		);
		this.netzachMotor = new NetzachCobyKPlayerMotor(gevurahRules);
		this.malchusKinetics = new MalchusCobyKKineticWorld(
			this.binaParsed,
			gevurahRules
		);
		this.gevurahCollision = new GevurahCobyKSolidCollisionAuthority(gevurahRules);
		this.tiferesInteractions = new TiferesInteractionAuthority(
			this.binaParsed,
			gevurahRules
		);
		this.yesodStaticSolids = Object.freeze(
			this.binaParsed.solids.filter(yesodSolid => !yesodSolid.kinetic)
		);
		this.hodLastEvents = Object.freeze({});
	}

	/**
	 * Advances one fixed step in stable order: trigger/carry moving support, motor, collision, then post-contact interactions.
	 * @param {object} netzachIntent Normalized movement intent.
	 * @returns {{outcome:string,events:object}} Fixed-step result for session policy.
	 */
	step(netzachIntent = {}) {
		const yesodPreviousSupportId = this.malchusPlayer.supportId;
		this.malchusKinetics.trigger(yesodPreviousSupportId);
		this.malchusKinetics.step();
		this.malchusPlayer.carry(
			this.malchusKinetics.revealDisplacement(yesodPreviousSupportId)
		);
		this.netzachMotor.step(this.malchusPlayer, netzachIntent);
		const binaContact = this.gevurahCollision.step(
			this.malchusPlayer,
			[
				...this.yesodStaticSolids,
				...this.malchusKinetics.revealColliders()
			]
		);
		this.malchusPlayer.adoptContact(binaContact);
		this.hodLastEvents = this.tiferesInteractions.step(
			this.malchusPlayer,
			this.malchusKinetics.revealHazards()
		);
		return Object.freeze({
			outcome: this.revealOutcome(),
			events: this.hodLastEvents
		});
	}

	/** @returns {string} `dead`, `completed`, or `playing` according to this attempt's current deterministic truth. */
	revealOutcome() {
		if (this.hodLastEvents.hazardId) return "dead";
		if (this.malchusPlayer.y + this.malchusPlayer.height < -1) return "dead";
		if (this.hodLastEvents.completed) return "completed";
		return "playing";
	}

	/** @returns {object} Frozen complete attempt snapshot for renderer, camera, HUD, tests, and diagnostics. */
	snapshot() {
		return Object.freeze({
			level: this.binaParsed,
			player: this.malchusPlayer.snapshot(),
			kinetics: this.malchusKinetics.snapshots(),
			interactions: this.tiferesInteractions.snapshot(),
			events: this.hodLastEvents,
			outcome: this.revealOutcome()
		});
	}
}
