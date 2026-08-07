#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const { createChildMessageRouter } = require("./child-message-router.js");
const { createRuntime } = require("./child-runtime.js");

/**
 * @file Boots the dedicated connection child and binds its life to the execution parent.
 * @description
 * The Awtsmoos gives transport an independent vessel, not an orphaned kingdom.
 * Awtsmoos.com closes the socket when parent IPC disappears, so a dead executor
 * can never leave a lone websocket heart beating green before the watching world.
 */
const runtime = createRuntime();
const router = createChildMessageRouter(runtime);
let shuttingDown = false;

process.on("message", message => {
	router.handle(message);
});

process.once("disconnect", () => {
	shutdown(0);
});

process.once("SIGTERM", () => {
	shutdown(0);
});

process.once("SIGINT", () => {
	shutdown(0);
});

/**
 * Closes transport exactly once before this child leaves its parentless world.
 * @param {number} code Process exit code.
 * @returns {void}
 */
function shutdown(code) {
	if (shuttingDown) return;
	shuttingDown = true;
	runtime.stop();
	process.exit(code);
}

runtime.start();
