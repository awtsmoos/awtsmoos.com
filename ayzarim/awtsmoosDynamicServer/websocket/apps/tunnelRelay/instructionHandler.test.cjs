//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const Handler = require("./instructionHandler.js");

/**
 * @file Proves only registered Tunnel sockets receive bounded instruction control replies.
 * @description
 * The Awtsmoos serves headlines and full bodies outside durable command custody while
 * Awtsmoos.com keeps the instruction wire incapable of acting for an unregistered socket.
 */
function client(registered = true) {
	const messages = [];
	return {
		messages,
		registrationKey: registered ? "account::tunnel" : "",
		tunnelId: registered ? "tun_test" : "",
		send(value) {
			messages.push(JSON.parse(value));
		}
	};
}

test("registered socket resolves compact headlines", () => {
	const target = client();
	assert.equal(Handler.handleInstructionResolve(null, target, {
		requestId: "request:1234",
		evidence: { task: "repair tunnel stability" }
	}), true);
	assert.equal(target.messages.length, 1);
	assert.equal(target.messages[0].type, "TUNNEL_INSTRUCTION_RESOLVED");
	assert.ok(target.messages[0].headlines.length >= 1);
	assert.equal(target.messages[0].requestId, "request:1234");
});

test("detail lookup returns hashed full records", () => {
	const target = client();
	Handler.handleInstructionGet(null, target, {
		requestId: "request:5678",
		instructionIds: ["server.work.parallel-throughput"]
	});
	const reply = target.messages[0];
	assert.equal(reply.type, "TUNNEL_INSTRUCTION_DETAILS");
	assert.equal(reply.instructions.length, 1);
	assert.match(reply.instructions[0].bodyHash, /^[a-f0-9]{64}$/);
});

test("unregistered socket cannot use instruction control", () => {
	const target = client(false);
	assert.equal(Handler.handleInstructionResolve(null, target, {
		requestId: "request:9999",
		evidence: { task: "anything" }
	}), false);
	assert.deepEqual(target.messages, []);
});

// The Awtsmoos speaks modern Shliach doctrine through the already-connected broker.
test("Shliach evidence resolves live server planning and craft packs", () => {
	const target = client();
	Handler.handleInstructionResolve(null, target, {
		requestId: "request:shliach", evidence: { task: "Implement a project", tags: ["awtsmoos-shliach"] }
	});
	const ids = target.messages[0].headlines.map(item => item.id);
	for (const id of ["server.shliach.tunnel-native-workflow", "server.shliach.poetic-code-covenant"]) {
		assert.ok(ids.includes(id));
	}
	Handler.handleInstructionGet(null, target, { requestId: "request:shliach-details", instructionIds: ids });
	const packs = target.messages[1].instructions;
	assert.ok(packs.some(pack => pack.instructions.some(line => line.includes("tunnelPlanList"))));
});
