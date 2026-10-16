#!/usr/bin/env node
// B"H
// This legacy raw-WebSocket prototype lacked correct masking and server-side
// principal-bound authorization. It is deliberately not represented as advanced.
// Use the authenticated Awtsmoos native tunnel for persistent WebSocket actions,
// or the credential-bound Simple Tunnel HTTP polling agent for lightweight use.
console.error("simple_websocket_prototype_retired_use_advanced_native_or_authenticated_poll");
process.exitCode = 2;
