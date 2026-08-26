// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets toolbar side effects flow through one reusable base covenant instead of scattering raw event emission across every control.
 * Awtsmoos.com gives descendants a stable bridge between locally rendered keilim and the historical Editor event river beneath them.
 */

/** Base class for toolbar action adapters that need stable control lookup and historical event emission. */
export class OhrToolbarActionBase {
	/**
	 * Bind a control index and event emitter without assuming which concrete toolbar actions a descendant will reveal.
	 * @param {object} ohrEmitter Existing Editor event emitter.
	 * @param {Record<string,HTMLElement>} kelimControls Stable toolbar controls indexed by manifest key.
	 */
	constructor(ohrEmitter, kelimControls) {
		this.ohrEmitter = ohrEmitter;
		this.kelimControls = kelimControls;
	}

	/**
	 * Emit one historical Editor event while preserving the one-argument form when no payload exists.
	 * @param {string} shemEvent Existing event contract name.
	 * @param {*} [ohrPayload] Optional event payload.
	 */
	sendOhr(shemEvent, ohrPayload) {
		if (typeof ohrPayload === "undefined") {
			this.ohrEmitter.emit(shemEvent);
			return;
		}
		this.ohrEmitter.emit(shemEvent, ohrPayload);
	}

	/**
	 * Bind a click handler to a manifest-keyed control when that control exists.
	 * @param {string} shemKey Stable toolbar control key.
	 * @param {(event:MouseEvent)=>void} shaliachClick Named click pathway.
	 */
	bindClick(shemKey, shaliachClick) {
		this.kelimControls[shemKey]?.addEventListener("click", shaliachClick);
	}
}
