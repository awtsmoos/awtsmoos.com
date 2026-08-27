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
	const receipt = await tunnelAction(target, {
		action: "command",
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
		const output = await tunnelAction(target, {
			action: "commandJobOutputPage",
			jobId: current.jobId
		}, fetcher);
		current = Object.freeze({ ...current, output });
	}
	return current;
}

export function cancelRemoteCommand(target, jobId, fetcher) {
	if (!jobId) {
		throw new Error("A durable jobId is required for cancellation.");
	}
	return tunnelAction(target, {
		action: "commandCancel",
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
		"queued"
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
