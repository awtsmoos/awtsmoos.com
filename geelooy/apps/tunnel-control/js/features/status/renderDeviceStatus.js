// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders the sanitized account device model into Tunnel Control.
 * @description
 * The Awtsmoos renews route, proof, and interface without letting raw inventory
 * become authority. Awtsmoos.com preserves familiar device-list testimony while
 * richer cards expose immutable route, vessel type, capability, and trust truth.
 */

import { $ } from "../../lib/dom.js";
import { sanitizeDiscoveryResponse } from "../vessels/deviceTrust.js";
import {
	bindTargetSelect,
	chooseTargetVessel,
	renderTargetOptions
} from "../vessels/selector.js";
import {
	connectedDeviceCard,
	deviceListCard,
	modeOverviewCard,
	offlineDeviceCard,
	securityWarningCard,
	selectedVesselCard,
	vesselFamiliesCard,
	vesselPeerCards,
	vesselTableCard
} from "./summaryCards.js";
import { setPill, setText } from "./statusText.js";
import { applyDiscoveredTunnelName } from "./tunnelDiscovery.js";

export function renderDeviceNice(response, _config, getTunnelName) {
	const discovery = sanitizeDiscoveryResponse(response || {});
	const effectiveName = applyDiscoveredTunnelName(discovery, getTunnelName);
	const select = $("targetVesselSelect");
	const selected = chooseTargetVessel(
		discovery,
		select?.value || effectiveName
	);
	renderTargetOptions(
		select,
		discovery,
		selected?.tunnelName || effectiveName
	);
	bindTargetSelect(select, name => {
		setText("selectedTargetVessel", name);
	});
	setText(
		"selectedTargetVessel",
		selected?.tunnelName || effectiveName || "No verified target"
	);
	if (discovery.sourceOk === false && !selected) {
		renderUnavailable(discovery);
		return discovery;
	}
	renderAvailable(discovery, selected);
	return discovery;
}

function renderAvailable(discovery, selected) {
	const native = discovery.nativeDevices || [];
	const browsers = discovery.browserDevices || [];
	const accountConnected = [...native, ...browsers].some(device => {
		return device.connected !== false && device.isAlive !== false;
	});
	setPill(
		"connectionPill",
		"connectionText",
		accountConnected ? "good" : "warn",
		accountConnected ? "Verified connection" : "Virtual OS"
	);
	setText(
		"miniAgent",
		selected?.tunnelName || selected?.deviceName || "No verified target"
	);
	const cards = [
		securityWarningCard(discovery.warnings),
		modeOverviewCard(discovery),
		vesselFamiliesCard(discovery),
		selectedVesselCard(selected),
		vesselTableCard(discovery, selected?.tunnelName),
		deviceListCard(discovery.devices || []),
		selected ? connectedDeviceCard(selected) : offlineDeviceCard(),
		vesselPeerCards(discovery)
	].filter(Boolean);
	$("deviceSummary")?.replaceChildren(...cards);
}

function renderUnavailable(discovery) {
	setPill(
		"connectionPill",
		"connectionText",
		"bad",
		"Discovery unavailable"
	);
	setText("miniAgent", "No verified target");
	$("deviceSummary")?.replaceChildren(
		securityWarningCard(discovery.warnings) || offlineDeviceCard(),
		offlineDeviceCard()
	);
}
