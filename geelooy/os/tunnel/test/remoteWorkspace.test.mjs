// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves OS mounts immutable routes and follows durable commands exactly once.
 * @description
 * The Awtsmoos lets one human command become one remote receipt. Awtsmoos.com
 * refuses friendly-name routing, fake Virtual OS shell power, and command replay.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	collectTargets,
	tunnelAction
} from "../remoteClient.js";
import {
	followRemoteCommand,
	startRemoteCommand
} from "../remoteCommand.js";

function response(body) {
	return {
		ok: true,
		status: 200,
		async json() {
			return body;
		}
	};
}

test("target discovery prefers immutable routeReference over display name", () => {
	const targets = collectTargets({
		nativeDevices: [{
			ownershipVerified: true,
			connected: true,
			isAlive: true,
			routeReference: "tun_immutable",
			tunnelId: "tun_fallback",
			tunnelName: "Friendly Mac",
			deviceName: "Mac",
			capabilities: { fsRead: true, commandRun: true }
		}]
	});
	assert.equal(targets[0].route, "tun_immutable");
	assert.equal(targets[0].displayName, "Friendly Mac");
});

test("Virtual OS fallback stays command-disabled when server says so", () => {
	const targets = collectTargets({
		virtualDevice: {
			ownedByCurrentUser: true,
			routeReference: "awtsmoos-virtual-os",
			allowWrite: true,
			allowCommands: false
		}
	});
	assert.equal(targets[0].canRead, true);
	assert.equal(targets[0].canCommand, false);
});

test("tunnel action posts canonical JSON to immutable route", async () => {
	let seen = null;
	const fetcher = async (url, options) => {
		seen = { url, options };
		return response({ ok: true });
	};
	await tunnelAction({ route: "tun_route" }, {
		action: "read",
		p: "README.md"
	}, fetcher);
	assert.equal(seen.url, "/api/tunnel/control/fs/tun_route");
	assert.equal(seen.options.method, "POST");
	assert.deepEqual(JSON.parse(seen.options.body), {
		action: "read",
		p: "README.md"
	});
});

test("command is dispatched once then followed by durable job identity", async () => {
	const actions = [];
	const fetcher = async (_url, options) => {
		const body = JSON.parse(options.body);
		actions.push(body);
		if (body.action === "command") {
			return response({ pending: true, jobId: "job-1", status: "pending" });
		}
		if (body.action === "commandStatus") {
			return response({ pending: false, jobId: "job-1", status: "completed" });
		}
		return response({ stdout: "B'H complete" });
	};
	const target = { route: "tun_route", canCommand: true };
	const receipt = await startRemoteCommand(target, "pwd", ".", fetcher);
	const final = await followRemoteCommand(target, receipt, {
		fetcher,
		pollMs: 1
	});
	assert.equal(actions.filter(item => item.action === "command").length, 1);
	assert.deepEqual(actions.map(item => item.action), [
		"command",
		"commandStatus",
		"commandJobOutputPage"
	]);
	assert.equal(final.output.stdout, "B'H complete");
});

test("command-incapable target is rejected before transport", async () => {
	await assert.rejects(
		startRemoteCommand({ route: "virtual", canCommand: false }, "pwd"),
		/does not allow native commands/
	);
});
