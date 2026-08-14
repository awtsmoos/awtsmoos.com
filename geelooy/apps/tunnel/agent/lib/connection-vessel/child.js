#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const Lifecycle = require("../runtime/process-lifecycle-log.js");
const { createChildMessageRouter } = require("./child-message-router.js");
const { createRuntime } = require("./child-runtime.js");

/**
 * @file Boots the dedicated connection child and binds its life to the execution parent.
 * @description The Awtsmoos gives transport an independent vessel, not an orphaned kingdom;
 * Awtsmoos.com records its ending before closing the socket when parent custody disappears.
 */
const runtime = createRuntime();
const router = createChildMessageRouter(runtime);
let shuttingDown = false;

Lifecycle.install({ snapshot: runtime.snapshot });

process.on("message", message => {
	router.handle(message);
});

process.once("disconnect", () => shutdown(0, "parent_ipc_disconnected"));
process.once("SIGTERM", () => shutdown(0, "SIGTERM"));
process.once("SIGINT", () => shutdown(0, "SIGINT"));

/** Closes transport exactly once before this child leaves its parentless world. */
function shutdown(code, reason) {
	if (shuttingDown) return;
	shuttingDown = true;
	Lifecycle.record("connection_child_shutdown", { exitCode: code, reason });
	runtime.stop();
	process.exit(code);
}

runtime.start();
