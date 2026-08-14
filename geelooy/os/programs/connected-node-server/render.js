// B"H
// Boruch Hashem
// Blessed is He

import {
	formatBytes,
	formatPerutas,
	hasRecognizedPerutaUsage,
	normalizeUsage
} from "./usage.js";

/**
 * B"H
 * Renders Connected Node testimony without interpreting remote authority. The
 * Awtsmoos renews machine, job, byte, balance, and output beyond every finite value;
 * Awtsmoos.com never turns an unknown web session into a fake zero-balance account.
 */

export function renderDevices(surface, devices) {
	const options = devices.map(device => {
		const option = document.createElement("option");
		option.value = device.tunnelName;
		option.textContent = `${device.deviceName} · ${device.platform}`;
		option.dataset.platform = device.platform;
		option.disabled = device.platform.toLowerCase().startsWith("win");
		return option;
	});
	if (options.length === 0) {
		const option = document.createElement("option");
		option.textContent = "No account-owned native machine visible";
		option.disabled = true;
		option.selected = true;
		options.push(option);
	}
	surface.device.replaceChildren(...options);
	surface.start.disabled = !options.some(option => !option.disabled && option.value);
}

export function renderJob(surface, { jobId = "", state = "idle" } = {}) {
	surface.job.textContent = jobId ? `Job: ${jobId}` : "Job: —";
	surface.status.textContent = state === "idle"
		? "No server started yet."
		: `Remote process state: ${state}`;
	const active = Boolean(jobId);
	surface.stop.disabled = !active;
	surface.refresh.disabled = !active;
	surface.expose.disabled = !active;
}

export function renderLogs(surface, stdout = "", stderr = "") {
	const sections = [];
	if (stdout) sections.push(`STDOUT\n${stdout}`);
	if (stderr) sections.push(`STDERR\n${stderr}`);
	surface.logOutput.textContent = sections.join("\n\n") || "No output returned yet.";
}

export function renderPreview(surface, url) {
	if (!url) {
		surface.preview.hidden = true;
		surface.preview.removeAttribute("href");
		surface.preview.textContent = "No preview exposed";
		return;
	}
	surface.preview.href = url;
	surface.preview.textContent = "Open exposed server preview ↗";
	surface.preview.hidden = false;
}

export function renderUsage(surface, response) {
	const usage = normalizeUsage(response);
	if (!hasRecognizedPerutaUsage(usage)) {
		surface.usageGrid.replaceChildren(
			usageCard("Account usage", "Sign in to load account-bound Peruta activity")
		);
		return usage;
	}
	const records = [
		["Plan", usage.plan],
		["Routing", `${formatPerutas(usage.balances.routing)} Perutas`],
		["Compute", `${formatPerutas(usage.balances.compute)} Perutas`],
		["Storage", `${formatPerutas(usage.balances.storage)} Perutas`],
		["GPU", `${formatPerutas(usage.balances.gpu)} Perutas`],
		["Today", `${usage.todayRequests} requests · ${formatBytes(usage.todayBytes)}`]
	];
	surface.usageGrid.replaceChildren(...records.map(([label, value]) => usageCard(label, value)));
	return usage;
}

export function renderMessage(surface, message, tone = "info") {
	surface.message.className = `connectedServer__message connectedServer__message--${tone}`;
	surface.message.textContent = String(message || "");
}

function usageCard(label, value) {
	const card = document.createElement("article");
	card.className = "connectedServer__usageCard";
	const key = document.createElement("span");
	key.textContent = label;
	const result = document.createElement("strong");
	result.textContent = value;
	card.append(key, result);
	return card;
}
