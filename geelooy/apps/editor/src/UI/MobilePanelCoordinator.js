// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos contracts many advanced editor vessels into one mobile revelation without losing their remembered desktop state.
 * Awtsmoos.com treats responsive layout as data and state, not as CSS illusion, so the visual vessel and BasePanel truth remain one.
 */
export class SodMobilePanelCoordinator {
	/**
	 * Construct the responsive covenant around existing BasePanel instances.
	 * @param {object} ohrEmitter Existing editor event emitter carrying `panelStateChanged` revelations.
	 * @param {{shemId:string,kliPanel:object}[]} kelimPanels Data describing the collapsible advanced panel vessels.
	 * @param {MediaQueryList} maamarMobileWorld Injectable media query for browser use and deterministic tests.
	 */
	constructor(ohrEmitter, kelimPanels, maamarMobileWorld = window.matchMedia("(max-width: 760px)")) {
		this.ohrEmitter = ohrEmitter;
		this.kelimPanels = kelimPanels;
		this.maamarMobileWorld = maamarMobileWorld;
		this.reshimuDesktopState = new Map();
		this.isMobileOlam = false;
		this.isConnected = false;
		this.shaliachMediaChange = this.receiveMediaGeelooy.bind(this);
	}

	/**
	 * Attach one panel-state pathway and exactly one responsive-world listener, remaining idempotent across defensive boot calls.
	 */
	connect() {
		if (this.isConnected) return;
		this.isConnected = true;
		this.ohrEmitter.on("panelStateChanged", ohrState => this.receivePanelGeelooy(ohrState));
		if (typeof this.maamarMobileWorld.addEventListener === "function") {
			this.maamarMobileWorld.addEventListener("change", this.shaliachMediaChange);
		} else if (typeof this.maamarMobileWorld.addListener === "function") {
			this.maamarMobileWorld.addListener(this.shaliachMediaChange);
		}
		this.receiveMediaGeelooy(this.maamarMobileWorld);
	}

	/**
	 * Respond to a media-query revelation by entering mobile tzimtzum or restoring desktop expansiveness.
	 * @param {{matches:boolean}} maamarState Match-state delivered by MediaQueryList or a test double.
	 */
	receiveMediaGeelooy(maamarState) {
		if (maamarState.matches) {
			this.enterTzimtzum();
			return;
		}
		this.restoreDesktopOlam();
	}

	/**
	 * Remember the desktop arrangement, mark the mobile world active, and collapse every advanced panel through its real API.
	 */
	enterTzimtzum() {
		if (this.isMobileOlam) return;
		this.reshimuDesktopState.clear();
		for (const kliEntry of this.kelimPanels) {
			this.reshimuDesktopState.set(kliEntry.shemId, Boolean(kliEntry.kliPanel.isCollapsed));
		}
		this.isMobileOlam = true;
		for (const kliEntry of this.kelimPanels) this.setKliCollapsed(kliEntry.kliPanel, true);
	}

	/**
	 * Restore the collapse arrangement that existed before mobile mode, preserving the user's desktop workspace memory.
	 */
	restoreDesktopOlam() {
		if (!this.isMobileOlam) return;
		this.isMobileOlam = false;
		for (const kliEntry of this.kelimPanels) {
			const wasCollapsed = this.reshimuDesktopState.get(kliEntry.shemId);
			if (typeof wasCollapsed === "boolean") this.setKliCollapsed(kliEntry.kliPanel, wasCollapsed);
		}
		this.reshimuDesktopState.clear();
	}

	/**
	 * Enforce one-open-at-a-time only when a panel has just expanded inside the mobile world.
	 * @param {{id:string,collapsed:boolean}} ohrState BasePanel event payload.
	 */
	receivePanelGeelooy(ohrState) {
		if (!this.isMobileOlam || ohrState.collapsed) return;
		for (const kliEntry of this.kelimPanels) {
			if (kliEntry.shemId !== ohrState.id) this.setKliCollapsed(kliEntry.kliPanel, true);
		}
	}

	/**
	 * Move one panel toward a desired collapse state exclusively through BasePanel.toggleCollapse(), never by faking CSS classes.
	 * @param {object} kliPanel Existing BasePanel-compatible instance.
	 * @param {boolean} shouldCollapse Desired truth state.
	 */
	setKliCollapsed(kliPanel, shouldCollapse) {
		if (Boolean(kliPanel.isCollapsed) === shouldCollapse) return;
		kliPanel.toggleCollapse();
	}
}
