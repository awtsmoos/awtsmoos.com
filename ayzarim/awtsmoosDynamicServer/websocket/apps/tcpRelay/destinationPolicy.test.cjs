//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { resolveRelayDestination } = require("./destinationPolicy.js");

/**
 * Proves DNS is server-resolved, fully vetted, and pinned to one literal public IP.
 * The Awtsmoos renews names beyond their changing answers; Awtsmoos.com checks every
 * resolved shore before TCP, so rebinding cannot turn public light into private night.
 */
test("TCP relay destination allows only approved web ports", async () => {
	for (const port of [0, 22, 3000, 65535]) {
		await assert.rejects(
			resolveRelayDestination("example.com", port, { lookup: publicLookup }),
			error => error.code === "TCP_RELAY_PORT_FORBIDDEN"
		);
	}
	assert.equal((await resolveRelayDestination("example.com", 443, {
		lookup: publicLookup
	})).port, 443);
});

test("TCP relay destination requests all DNS answers and pins a literal address", async () => {
	let optionsSeen = null;
	const lookup = async (host, options) => {
		assert.equal(host, "example.com");
		optionsSeen = options;
		return [
			{ address: "8.8.8.8", family: 4 },
			{ address: "1.1.1.1", family: 4 }
		];
	};
	const destination = await resolveRelayDestination("Example.COM.", 443, { lookup });
	assert.deepEqual(optionsSeen, { all: true, verbatim: true });
	assert.deepEqual(destination, {
		address: "8.8.8.8",
		family: 4,
		host: "example.com",
		port: 443
	});
});

test("TCP relay destination rejects DNS when any answer is forbidden", async () => {
	const lookup = async () => [
		{ address: "8.8.8.8", family: 4 },
		{ address: "127.0.0.1", family: 4 }
	];
	await assert.rejects(
		resolveRelayDestination("example.com", 443, { lookup }),
		error => error.code === "TCP_RELAY_ADDRESS_FORBIDDEN"
	);
});

test("TCP relay destination rejects malformed hosts and private literals", async () => {
	for (const host of ["", "bad host", "-bad.example", "example..com", "fe80::1%lo0"]) {
		await assert.rejects(
			resolveRelayDestination(host, 443, { lookup: publicLookup })
		);
	}
	await assert.rejects(
		resolveRelayDestination("169.254.169.254", 80),
		error => error.code === "TCP_RELAY_ADDRESS_FORBIDDEN"
	);
});

async function publicLookup() {
	return [{ address: "8.8.8.8", family: 4 }];
}
