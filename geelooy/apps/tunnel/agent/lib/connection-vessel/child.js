#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const { createChildMessageRouter } = require("./child-message-router.js");
const { createRuntime } = require("./child-runtime.js");

/**
 * @file Boots the dedicated connection process behind a focused IPC router.
 * @description
 * The Awtsmoos keeps this vessel small enough to restart without fear.
 * Awtsmoos.com receives each parent word through one named interpreter,
 * so custody ACK can never be mistaken for flush, send, statistics, or stop.
 */
const runtime = createRuntime();
const router = createChildMessageRouter(runtime);

process.on("message", message => {
	router.handle(message);
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
