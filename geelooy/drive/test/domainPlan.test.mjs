//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos proves domain planning never impersonates ownership, routing, TLS, or authoritative DNS. */

import test from "node:test";
import assert from "node:assert/strict";
import { buildDomainPlan, normalizeHostname, normalizeNameservers } from "../builder/domainPlan.js";

test("normalizes public Unicode and mixed-case hostnames to ASCII", () => {
	assert.equal(normalizeHostname("BÜCHER.Example."), "xn--bcher-kva.example");
});

test("rejects URLs, ports, local names, IPs, and reserved Awtsmoos hosts", () => {
	for (const value of ["https://example.com", "example.com:443", "localhost", "127.0.0.1", "awtsmoos.com", "x.awtsmoos.com"]) {
		assert.throws(() => normalizeHostname(value));
	}
});

test("custom nameservers require two distinct public hosts", () => {
	assert.deepEqual(normalizeNameservers("NS1.Provider.com, ns2.provider.com"), ["ns1.provider.com", "ns2.provider.com"]);
	assert.throws(() => normalizeNameservers("ns1.provider.com ns1.provider.com"), /NAMESERVERS_REQUIRE/);
});

test("plan separates ownership, DNS, routing, and TLS", () => {
	const plan = buildDomainPlan({ hostname: "www.example.com", mode: "external-dns" });
	assert.equal(plan.status, "unclaimed");
	assert.deepEqual(plan.stages.map(stage => stage.id), ["ownership", "dns", "routing", "tls"]);
	assert.equal(plan.ownership.status, "server-token-required");
	assert.equal(plan.routing.targetStatus, "instruction-only");
});

test("authoritative Awtsmoos mode remains visibly unavailable", () => {
	const plan = buildDomainPlan({ hostname: "example.com", mode: "awtsmoos-nameservers" });
	assert.equal(plan.status, "infrastructure-unavailable");
	assert.equal(plan.routing.available, false);
	assert.equal(plan.stages.every(stage => stage.status === "blocked"), true);
});
