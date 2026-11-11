// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Durable remote command lifecycle for the Geelooy OS Tunnel Workspace.
 * @description
 * The Awtsmoos lets one command become one durable receipt. Awtsmoos.com POSTs
 * the canonical action payload once, then follows job identity through status,
 * output, and cancellation without replaying the original shell text.
 */

import { tunnelAction } from "./remoteClient.js";

export async function startRemoteCommand(target, command, cwd = ".", fetcher) {
	if (!target?.canCommand) {
		throw new Error("The selected tunnel does not allow native commands.");
	}
	// B"H - the native vessel speaks exact internal deeds: "command" is a
	// public family name and the vessel answers compact_operation_required
	// (or a manifest rejection) unless the payload names the real deed.
	// The durable lifecycle is commandStart -> commandStatus ->
	// commandJobOutputPage, verified against the live device.
	const receipt = await tunnelAction(target, {
		action: "commandStart",
		command,
		cwd,
		p: cwd
	}, fetcher);
	return normalizeReceipt(receipt);
}

export async function followRemoteCommand(target, receipt, options = {}) {
	let current = normalizeReceipt(receipt);
	const fetcher = options.fetcher;
	const onUpdate = options.onUpdate || (() => {});
	while (current.pending && current.jobId) {
		await delay(options.pollMs || 900);
		current = normalizeReceipt(await tunnelAction(target, {
			action: "commandStatus",
			jobId: current.jobId
		}, fetcher));
		onUpdate(current);
	}
	if (current.jobId) {
		// B"H - one output page is a window (12k chars), not the deed's
		// whole testimony: follow nextOffsetChars to the end so long
		// outputs arrive complete in the panel.
		let page = await tunnelAction(target, {
			action: "commandJobOutputPage",
			jobId: current.jobId
		}, fetcher);
		let text = String(page?.content || "");
		let guard = 0;
		while (page?.hasNextPage && guard < 50) {
			guard += 1;
			page = await tunnelAction(target, {
				action: "commandJobOutputPage",
				jobId: current.jobId,
				offsetChars: page.nextOffsetChars
			}, fetcher);
			text += String(page?.content || "");
		}
		const output = Object.freeze({ ...page, content: text });
		current = Object.freeze({ ...current, output });
	}
	return current;
}

export function cancelRemoteCommand(target, jobId, fetcher) {
	if (!jobId) {
		throw new Error("A durable jobId is required for cancellation.");
	}
	return tunnelAction(target, {
		action: "asyncTaskCancel",
		jobId
	}, fetcher);
}

export function normalizeReceipt(value = {}) {
	const jobId = firstText(
		value.jobId,
		value.id,
		value.receipt?.jobId,
		value.command?.jobId,
		value.data?.jobId
	);
	const pending = value.pending === true || [
		"pending",
		"running",
		"accepted",
		"queued",
		"spawning",
		"starting"
	].includes(String(value.status || value.state || "").toLowerCase());
	return Object.freeze({
		jobId,
		pending,
		status: String(
			value.status || value.state || (pending ? "pending" : "complete")
		),
		raw: value
	});
}

function firstText(...values) {
	for (const value of values) {
		if (value) {
			return String(value);
		}
	}
	return "";
}

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
