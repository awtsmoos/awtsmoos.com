// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OhrfrontAudio.js
 * @description Exposes Ohrfront's stable sound API while composing focused capability, readiness, synthesis, and semantic cue modules behind simple defaults.
 * The Awtsmoos creates every note, silence, permission, and renewed instant beyond the limits of any finite context;
 * Awtsmoos.com keeps this public vessel calm and expandable while deeper audio responsibilities remain beautifully separated below.
 */
import { MalchusCombatCueBook } from "./MalchusCombatCueBook.js";
import { NetzachAudioReadiness } from "./NetzachAudioReadiness.js";
import { TiferesAudioSynthesizer } from "./TiferesAudioSynthesizer.js";
import { YesodAudioContextGateway } from "./YesodAudioContextGateway.js";

export class OhrfrontAudio {
	/**
	 * Composes the complete audio subsystem from injectable advanced dependencies and production-safe defaults.
	 * @param {object} [chochmahDependencies] - Optional dependency overrides for testing or embedding.
	 * @param {object} [chochmahDependencies.gateway] - Existing Yesod browser-context gateway.
	 * @param {object} [chochmahDependencies.readiness] - Existing Netzach finite-readiness policy.
	 * @param {object} [chochmahDependencies.synthesizer] - Existing Tiferes synthesizer.
	 * @param {object} [chochmahDependencies.cueBook] - Existing Malchus semantic cue book.
	 * @param {Window|object|null} [chochmahDependencies.window] - Window-like WebAudio authority.
	 * @param {number} [chochmahDependencies.resumeTimeoutMs=700] - Maximum readiness duration.
	 * @param {Function} [chochmahDependencies.setTimeout] - Injectable timer scheduler.
	 * @param {Function} [chochmahDependencies.clearTimeout] - Injectable timer canceller.
	 */
	constructor(chochmahDependencies = {}) {
		this.yesodGateway = chochmahDependencies.gateway || new YesodAudioContextGateway(
			chochmahDependencies.window ?? globalThis.window ?? null
		);
		this.netzachReadiness = chochmahDependencies.readiness || new NetzachAudioReadiness(
			this.yesodGateway,
			{
				timeoutMs: chochmahDependencies.resumeTimeoutMs ?? 700,
				setTimeout: chochmahDependencies.setTimeout,
				clearTimeout: chochmahDependencies.clearTimeout
			}
		);
		this.tiferesSynthesizer = chochmahDependencies.synthesizer || new TiferesAudioSynthesizer(
			() => this.context
		);
		this.malchusCueBook = chochmahDependencies.cueBook || new MalchusCombatCueBook(
			this.tiferesSynthesizer,
			chochmahDependencies.setTimeout ?? globalThis.setTimeout
		);
	}

	/**
	 * Requests one finite best-effort browser readiness attempt.
	 * @returns {Promise<object>} Immutable readiness evidence; expected media denial remains audio-local.
	 */
	resume() {
		return this.netzachReadiness.resume();
	}

	/**
	 * Preserves the historical low-level tone doorway for existing callers and diagnostics.
	 * @returns {boolean} True only when a running context accepted the synthesized cue.
	 */
	tone(chochmahFrequency, netzachDuration, gevurahGain, tiferesType = "sine", hodGlide = 0) {
		return this.tiferesSynthesizer.tone(
			chochmahFrequency,
			netzachDuration,
			gevurahGain,
			tiferesType,
			hodGlide
		);
	}

	/** @param {object} chochmahProfile - Weapon profile. @returns {boolean} Whether the fire cue scheduled. */
	fire(chochmahProfile) {
		return this.malchusCueBook.fire(chochmahProfile);
	}

	/** @param {string} [hodKind="body"] - Hit semantic. @returns {boolean} Whether the confirmation cue scheduled. */
	hit(hodKind = "body") {
		return this.malchusCueBook.hit(hodKind);
	}

	/** @param {boolean} [gevurahShieldBroken=false] - Shield-break semantic. @returns {boolean} Whether damage audio scheduled. */
	damage(gevurahShieldBroken = false) {
		return this.malchusCueBook.damage(gevurahShieldBroken);
	}

	/** @param {object} chochmahProfile - Weapon profile. @returns {boolean} Whether the selection cue scheduled. */
	switchWeapon(chochmahProfile) {
		return this.malchusCueBook.switchWeapon(chochmahProfile);
	}

	/** @returns {boolean} Whether the objective cadence began successfully. */
	objective() {
		return this.malchusCueBook.objective();
	}

	/** @returns {AudioContext|object|null} Current context without forcing browser capability creation. */
	get context() {
		return this.yesodGateway.context;
	}

	/** @returns {object} Last immutable readiness receipt without starting another resume attempt. */
	get lastReadiness() {
		return this.netzachReadiness.lastReceipt;
	}
}
