//B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const { systemdSocketFd } = require("./listenerLifecycle.js");

test("systemd socket activation adopts fd 3 only for this process", () => {
	const pid = 4242;
	assert.equal(systemdSocketFd({
		LISTEN_PID: String(pid),
		LISTEN_FDS: "1"
	}, pid), 3);
	assert.equal(systemdSocketFd({
		LISTEN_PID: String(pid),
		LISTEN_FDS: "2"
	}, pid), 3);
});

test("foreign or malformed socket activation is ignored", () => {
	const pid = 4242;
	assert.equal(systemdSocketFd({}, pid), null);
	assert.equal(systemdSocketFd({ LISTEN_PID: "999", LISTEN_FDS: "1" }, pid), null);
	assert.equal(systemdSocketFd({ LISTEN_PID: String(pid), LISTEN_FDS: "0" }, pid), null);
	assert.equal(systemdSocketFd({ LISTEN_PID: String(pid), LISTEN_FDS: "wat" }, pid), null);
});
