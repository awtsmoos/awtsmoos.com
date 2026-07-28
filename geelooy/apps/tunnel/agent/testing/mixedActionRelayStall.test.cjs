// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { IsolatedRelay } = require("./helpers/isolatedRelay/server.cjs");
const Fixture = require("./helpers/isolatedRelay/fixture.cjs");
const Support = require("./helpers/isolatedRelay/testSupport.cjs");

/**
 * Reproduces the reported half-alive pattern against the actual agent:
 * many durable waits stay open while status, cancellation, diagnostics,
 * history, filesystem reads, and a post-drop action must still complete.
 */
(async () => {
	const relay = new IsolatedRelay({ tunnelId: "tun_mixed_stall_proof" });
	await relay.listen();
	const fixture = Fixture.createFixture(relay.address(), {
		tunnelId: relay.tunnelId,
		tunnelName: "awt-mixed-stall-proof"
	});
	enableCommands(fixture);
	writeEvidence(fixture.projectRoot);
	const child = fixture.spawnAgent();
	const childLog = Support.captureChild(child);
	try {
		await Support.waitUntil(() => relay.registrations.length >= 1, 12000);
		const connection = relay.latest();
		const started = await action(connection, relay, "start-long", {
			action: "commandStart",
			command: `${JSON.stringify(process.execPath)} -e "setTimeout(() => {}, 20000)"`,
			cwd: ".",
			timeoutMs: 60000
		});
		assert.equal(started.ok, true, JSON.stringify(started));
		assert.ok(started.jobId, JSON.stringify(started));

		const waitIds = Array.from({ length: 48 }, (_, index) => `wait-${index}`);
		for (const [index, id] of waitIds.entries()) {
			send(connection, id, {
				action: "commandWait",
				jobId: started.jobId,
				waitTimeoutMs: 10000,
				pollIntervalMs: 100
			}, `waiting-agent-${index}`);
		}
		await Support.delay(300);

		const lightweight = [
			["status", {
				action: "commandJobStatus",
				jobId: started.jobId
			}],
			["output", {
				action: "commandJobOutputPage",
				jobId: started.jobId,
				stream: "stdout",
				maxChars: 1000
			}],
			["tunnel-doctor", { action: "tunnelDoctor", p: "." }],
			["agent-doctor", { action: "agentDoctor", p: "." }],
			["stat", { action: "stat", p: "proof-a.txt" }],
			["list", { action: "list", p: ".", limit: 5 }],
			["read-many", {
				action: "readManyLines",
				ranges: [
					{ path: "proof-a.txt", startLine: 1, endLine: 2 },
					{ path: "proof-b.txt", startLine: 1, endLine: 2 },
					{ path: "proof-c.txt", startLine: 1, endLine: 2 }
				]
			}],
			["history", {
				action: "actionHistorySearch",
				query: "proof",
				limit: 50
			}]
		];
		const lightStarted = Date.now();
		const lightResponses = await Promise.all(lightweight.map(([id, payload], index) =>
			action(connection, relay, id, payload, `observer-${index}`, 5000)
		));
		const lightElapsedMs = Date.now() - lightStarted;
		assert.ok(
			lightResponses.every(response => response.ok !== false),
			JSON.stringify(lightResponses)
		);
		assert.ok(lightElapsedMs < 5000, `lightweight actions took ${lightElapsedMs}ms`);

		const cancelStarted = Date.now();
		const cancelled = await action(connection, relay, "cancel-long", {
			action: "commandJobCancel",
			jobId: started.jobId
		}, "controller", 7000);
		const cancelElapsedMs = Date.now() - cancelStarted;
		assert.equal(cancelled.status, "cancelled", JSON.stringify(cancelled));
		assert.ok(cancelElapsedMs < 7000, `cancel took ${cancelElapsedMs}ms`);

		await Promise.all(waitIds.map(id => response(relay, id, 7000)));
		const droppedSequence = connection.sequence;
		connection.destroy();
		await Support.waitUntil(
			() => relay.latest()?.sequence > droppedSequence,
			12000
		);
		const reconnected = relay.latest();
		const postDrop = await action(reconnected, relay, "post-drop-stat", {
			action: "stat",
			p: "proof-a.txt"
		}, "post-drop-agent", 5000);
		assert.equal(postDrop.ok, true, JSON.stringify(postDrop));

		console.log(JSON.stringify({
			ok: true,
			suite: "mixed-action-relay-stall",
			simultaneousWaits: waitIds.length,
			lightweightActions: lightweight.length,
			lightElapsedMs,
			cancelElapsedMs,
			diagnosticsEscaped: true,
			filesystemEscaped: true,
			outputObservationEscaped: true,
			postDisconnectActionPassed: true
		}, null, 2));
	} catch (error) {
		error.message += `\nrelay messages:\n${JSON.stringify(
			relay.messages.map(entry => ({
				type: entry.message?.type,
				id: entry.message?.id,
				action: entry.message?.action,
				phase: entry.message?.phase,
				ok: entry.message?.ok,
				error: entry.message?.error
			})),
			null,
			2
		)}`;
		error.message += `\nchild stdout:\n${childLog.stdout}\nchild stderr:\n${childLog.stderr}`;
		throw error;
	} finally {
		await Support.stopChild(child);
		await relay.close().catch(() => {});
		fixture.cleanup();
	}
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

function enableCommands(fixture) {
	const file = path.join(fixture.installRoot, "config.json");
	const config = JSON.parse(fs.readFileSync(file, "utf8"));
	config.allowCommands = true;
	config.tools.command = true;
	config.command.enabled = true;
	fs.writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
}

function writeEvidence(root) {
	for (const name of ["a", "b", "c"]) {
		fs.writeFileSync(path.join(root, `proof-${name}.txt`), `proof ${name}\nready\n`);
	}
}

function send(connection, id, payload, requesterKey = "mixed-agent") {
	connection.sendJson({
		type: "TUNNEL_REQUEST",
		id,
		requesterKey,
		payload
	});
}

async function action(
	connection,
	relay,
	id,
	payload,
	requesterKey = "mixed-agent",
	timeoutMs = 8000
) {
	send(connection, id, payload, requesterKey);
	const found = await response(relay, id, timeoutMs);
	connection.sendJson({ type: "TUNNEL_RESPONSE_ACK", id });
	return found;
}

function response(relay, id, timeoutMs) {
	return Support.waitUntil(() => {
		const found = relay.messages
			.map(entry => entry.message)
			.find(message => message?.type === "TUNNEL_RESPONSE" && message.id === id);
		return found || false;
	}, timeoutMs);
}
