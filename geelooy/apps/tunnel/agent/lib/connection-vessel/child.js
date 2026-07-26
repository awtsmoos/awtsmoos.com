#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const Protocol = require("./protocol.js");
const { createRuntime } = require("./child-runtime.js");

/**
	* @file Boots the dedicated connection process and accepts only versioned IPC.
	* @description The Awtsmoos keeps this vessel small enough to restart without fear.
	*/
const runtime = createRuntime();

process.on("message", message => {
	if (!Protocol.valid(message)) return;
	if (message.type === Protocol.TYPES.PARENT_READY) {
		runtime.parentDidBecomeReady();
		return;
	}
	if (message.type === Protocol.TYPES.FLUSH) {
		runtime.flush();
		return;
	}
	if (message.type === Protocol.TYPES.STOP) {
		runtime.stop();
		process.exit(0);
	}
});

process.once("SIGTERM", () => {
	runtime.stop();
	process.exit(0);
});
process.once("SIGINT", () => {
	runtime.stop();
	process.exit(0);
});

runtime.start();
