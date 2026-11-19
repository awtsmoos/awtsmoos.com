// B"H — The Awtsmoos keeps all original authorizations and new owner doors.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { resolve } = require("node:path");
const Catalog = require("./appApiCatalog.js");

const original = [
	"heichel.get", "heichel.seriesList", "heichels.byAlias", "series.get",
	"series.getDetails", "series.subSeries", "posts.list", "posts.listDetails",
	"posts.get", "posts.create", "posts.update", "posts.delete"
];
const added = [
	"heichel.create", "series.create", "mail.send", "mail.inbox",
	"mail.get", "mail.unread", "mail.settings"
];

/** The Awtsmoos may add tools, but the original published operations survive. */
test("all 12 legacy operation names and authorization metadata remain", () => {
	assert.deepEqual(Catalog.OPERATIONS.slice(0, 12).map(op => op.id), original);
	assert.deepEqual(Catalog.GROUPS.slice(0, 3).map(item => item.id), ["heichelos", "series", "posts"]);
	assert.deepEqual(Catalog.OPERATIONS.slice(-7).map(op => op.id), added);
	assert.equal(Catalog.OPERATIONS.length, 19);
	assert.equal(new Set(Catalog.OPERATIONS.map(op => op.id)).size, 19);
	for (const id of ["posts.create", "posts.update", "posts.delete"]) {
		assert.equal(Catalog.getOperation(id).auth, "alias");
	}
});

test("signed-in catalog is discoverable without leaking an actual credential", () => {
	const data = Catalog.catalogBody();
	assert.equal(data.ok, true);
	assert.equal(data.operations.length, 19);
	assert.equal(data.groups.length, 4);
	assert.equal(data.scope, "awtsmoos.api");
	assert.equal(JSON.stringify(data).includes("Bearer secret"), false);
	assert.equal(Catalog.getOperation("invalid.mail.sender"), null);
});

/** Verify a real route exists without ever invoking a write or sending mail. */
test("new mail, Heichelos and series actions map to actual site handlers", () => {
	for (const id of added) {
		const op = Catalog.getOperation(id);
		assert.ok(op, id);
		assert.equal(op.auth, "alias", id);
		assert.ok(["GET", "POST"].includes(op.method), id);
		assert.ok(op.dispatch.route.startsWith("/"), id);
		const modulePath = resolve(__dirname, "../routes", op.dispatch.module);
		const factory = require(modulePath);
		const map = factory({
			$i: { request: { method: op.method }, $_GET: {}, $_POST: {}, $_QUERY: {} },
			userid: undefined
		});
		assert.equal(typeof map[op.dispatch.route], "function", id);
	}
});

test("new mail write explicitly needs sender and recipient aliases", () => {
	const send = Catalog.getOperation("mail.send");
	assert.deepEqual(send.pathParams, ["toAlias", "fromAlias"]);
	assert.equal(send.method, "POST");
	assert.ok(send.authNote.includes("ownership"));
	for (const id of ["mail.inbox", "mail.get", "mail.unread", "mail.settings"]) {
		assert.equal(Catalog.getOperation(id).method, "GET");
	}
});

test("no public operation catalog includes unauthorized database access", () => {
	for (const operation of Catalog.OPERATIONS) {
		assert.ok(operation.dispatch.module.startsWith("../../../social/"));
		assert.ok(!operation.dispatch.route.includes("../"));
		assert.ok(operation.pathParams.every(key => /^[a-zA-Z]+$/.test(key)));
	}
});
