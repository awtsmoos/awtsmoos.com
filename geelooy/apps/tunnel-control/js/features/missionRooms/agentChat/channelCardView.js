//B"H
//Boruch Hashem
//Blessed is He

import { agentInitials, channelClass, node } from "./dom.js";

/**
 * B"H
 * The Awtsmoos gives each agent a distinct operational face without dividing the
 * single current that creates them all. Awtsmoos.com reveals identity, labor,
 * telemetry, transport, and direct access inside one selectable vessel.
 */

/** Builds one tactile agent channel card. */
export function createChannelCard(channel, selectedAgentId, actions, index) {
	const button = node("button", channelClass(channel, selectedAgentId));
	button.type = "button";
	button.dataset.agentId = channel.agentId;
	button.dataset.transport = transportKind(channel);
	button.style.setProperty("--awt-agent-order", String(index));
	button.setAttribute("role", "listitem");
	button.setAttribute("aria-pressed", String(channel.agentId === selectedAgentId));
	button.addEventListener("click", () => actions.select?.(channel.agentId));
	button.append(
		createIdentity(channel),
		createTelemetry(channel),
		createChannelFooter(channel)
	);
	return button;
}

function createIdentity(channel) {
	const header = node("span", "awt-agent-channel-identity");
	const avatar = node("span", "awt-agent-avatar", agentInitials(channel.name));
	avatar.append(node("i", "awt-agent-avatar-presence"));
	const copy = node("span", "awt-agent-identity-copy");
	copy.append(
		node("strong", "", channel.name),
		node("small", "", channel.role)
	);
	const status = node(
		"span",
		"awt-agent-state-badge",
		channel.isWorking ? "Working" : "Observing"
	);
	header.append(avatar, copy, status);
	return header;
}

function createTelemetry(channel) {
	const telemetry = node("span", "awt-agent-telemetry");
	telemetry.append(
		createTelemetryCell("Events", channel.activityCount),
		createTelemetryCell("Failures", channel.failures),
		createTelemetryCell("Latest", readableEvent(channel.lastType))
	);
	return telemetry;
}

function createTelemetryCell(label, value) {
	const cell = node("span", "awt-agent-telemetry-cell");
	cell.append(
		node("small", "", label),
		node("strong", "", String(value))
	);
	return cell;
}

function createChannelFooter(channel) {
	const footer = node("span", "awt-agent-channel-footer");
	footer.append(
		node("span", "awt-agent-transport-label", channel.connectionLabel),
		node("span", "awt-agent-open-channel", "Open direct channel →")
	);
	return footer;
}

function readableEvent(value) {
	return String(value || "observed").replaceAll(/[._:-]+/g, " ");
}

function transportKind(channel) {
	if (channel.roomWebSocketConnected && channel.accountWebSocketConnected) {
		return "dual";
	}
	if (channel.accountWebSocketConnected) return "account";
	if (channel.roomWebSocketConnected) return "room";
	return "fallback";
}
