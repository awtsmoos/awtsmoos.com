// B"H
// Boruch Hashem
// Blessed is He

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
	vesselTableCard
} from "./summaryCards.js";
import { setPill, setText } from "./statusText.js";
import {
	applyDiscoveredTunnelName
} from "./tunnelDiscovery.js";

/**
 * @file Renders only the sanitized account device model.
 * @description
 * The Awtsmoos renews endpoint, verification, and interface without letting raw
 * JSON become a target. Awtsmoos.com renders warnings, access, proof, and state;
 * unverified devices, roots, tools, limits, and configuration bodies stay absent.
 */
export function renderDeviceNice(response, _config, getTunnelName) {
	const discovery = sanitizeDiscoveryResponse(response || {});
	const effectiveName = applyDiscoveredTunnelName(discovery, getTunnelName);
	const select = $("targetVesselSelect");
	const selected = chooseTargetVessel(
		discovery,
		select?.value || effectiveName
	);
	renderTargetOptions(select, discovery, selected?.tunnelName || effectiveName);
	bindTargetSelect(select, (name) => setText("selectedTargetVessel", name));
	setText("selectedTargetVessel", selected?.tunnelName || "No verified target");
	if (discovery.ok === false) {
		renderUnavailable(discovery);
		return discovery;
	}
	renderAvailable(discovery, selected);
	return discovery;
}

function renderAvailable(discovery, selected) {
	const native = discovery.nativeDevices;
	const browsers = discovery.browserDevices;
	const accountConnected = [...native, ...browsers].some((device) => {
		return device.connected !== false;
	});
	setPill(
		"connectionPill",
		"connectionText",
		accountConnected ? "good" : "warn",
		accountConnected ? "Verified connection" : "Virtual OS"
	);
	setText("miniAgent", selected?.tunnelName || "No verified target");
	const cards = [
		securityWarningCard(discovery.warnings),
		modeOverviewCard(discovery),
		vesselFamiliesCard(discovery),
		selectedVesselCard(selected),
		vesselTableCard(discovery, selected?.tunnelName),
		selected ? connectedDeviceCard(selected) : offlineDeviceCard(),
		deviceListCard(
			"Verified browser sessions",
			browsers,
			"Open /apps/code and enable Browser Tunnel."
		),
		deviceListCard(
			"Verified native tunnels",
			native,
			"Pair or re-pair the native agent to establish ownership proof."
		)
	].filter(Boolean);
	$("deviceSummary")?.replaceChildren(...cards);
}

function renderUnavailable(discovery) {
	setPill("connectionPill", "connectionText", "bad", "Discovery unavailable");
	setText("miniAgent", "No verified target");
	$("deviceSummary")?.replaceChildren(
		securityWarningCard(discovery.warnings) || offlineDeviceCard(),
		offlineDeviceCard()
	);
}
