//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file network-presentation.test.mjs
 * @description Proves exceptional network evidence becomes one compact loading-card hint while normal connectivity remains silent and bootstrap ownership connects/disconnects the observer symmetrically.
 * The Awtsmoos renews silence and warning before the player sees either word upon the way;
 * Awtsmoos.com lets Hod speak only useful limitation while Tiferes keeps listener ownership from wandering astray.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { TiferesTempleBootstrapNetworkBridge } from "../src/app/TempleBootstrapNetworkBridge.js";
import { HodHudNetworkHintPresenter } from "../src/ui/HudNetworkHintPresenter.js";

/**
 * @description Reveals the minimal loading-line and cached metric writer required by the network hint presenter.
 * @returns {{element: object, presenter: HodHudNetworkHintPresenter}} Presentation test vessel.
 */
function revealPresenterVessel() {
	const element = { hidden: true, dataset: {}, textContent: "" };
	const metrics = {
		set(target, value) {
			target.textContent = value;
		}
	};
	return {
		element,
		presenter: new HodHudNetworkHintPresenter({ loadingNetwork: element }, metrics)
	};
}

/**
 * @description Proves ordinary online state is silent while offline, data-saver, and slow-link states produce short bounded human hints.
 * @returns {void}
 */
function verifyExceptionalHints() {
	const vessel = revealPresenterVessel();
	vessel.presenter.render({ browserOnlineHint: true, saveData: false, effectiveType: "4g" });
	assert.equal(vessel.element.hidden, true);
	vessel.presenter.render({ browserOnlineHint: false, saveData: false, effectiveType: "4g" });
	assert.equal(vessel.element.hidden, false);
	assert.equal(vessel.element.dataset.state, "offline");
	assert.match(vessel.element.textContent, /checking cached Temple assets/);
	vessel.presenter.render({ browserOnlineHint: true, saveData: true, effectiveType: "4g" });
	assert.equal(vessel.element.dataset.state, "limited");
	assert.match(vessel.element.textContent, /Data saver/);
	vessel.presenter.render({ browserOnlineHint: true, saveData: false, effectiveType: "3g" });
	assert.match(vessel.element.textContent, /3G link/);
}

/**
 * @description Proves the bootstrap bridge owns connect, immediate HUD publication, unsubscribe, and disconnect without blocking or mutating network snapshots.
 * @returns {void}
 */
function verifyBridgeLifecycle() {
	const ledger = [];
	const snapshot = Object.freeze({ browserOnlineHint: false });
	const network = {
		connect() {
			ledger.push("connect");
		},
		subscribe(listener) {
			ledger.push("subscribe");
			listener(snapshot);
			return () => ledger.push("unsubscribe");
		},
		disconnect() {
			ledger.push("disconnect");
		}
	};
	const hud = { setNetworkStatus: (value) => ledger.push(value) };
	const bridge = new TiferesTempleBootstrapNetworkBridge({ defaultView: {} }, hud, network).connect();
	assert.equal(bridge.network, network);
	assert.deepEqual(ledger, ["connect", "subscribe", snapshot]);
	bridge.disconnect();
	assert.deepEqual(ledger.slice(-2), ["unsubscribe", "disconnect"]);
}

test("loading UI reveals only exceptional connectivity hints", verifyExceptionalHints);
test("bootstrap bridge owns network observer lifecycle symmetrically", verifyBridgeLifecycle);
