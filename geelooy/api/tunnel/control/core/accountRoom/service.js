// B"H
"use strict";
const { mutateStore, readStore } = require("../store.js");
const Model = require("./model.js");

/**
 * @file The shared account's room belongs to the server's durable store.
 * A Mac and Linux tunnel observe the same authenticated account namespace,
 * not separate local mission directories or unverified owner decisions.
 */
function join(accountId, actor, input) {
	let result;
	mutateStore(store => {
		result = Model.join(store, accountId, actor, input);
		return store;
	});
	return result;
}

function send(accountId, actor, input) {
	let result;
	mutateStore(store => {
		result = Model.send(store, accountId, actor, input);
		return store;
	});
	return result;
}

function snapshot(accountId, since) {
	return Model.snapshot(readStore(), accountId, since);
}

module.exports = { join, send, snapshot };
