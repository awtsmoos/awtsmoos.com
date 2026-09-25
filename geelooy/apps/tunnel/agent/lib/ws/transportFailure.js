// B"H

// Boruch Hashem

// Blessed is He

const Monotonic = require("../runtime/monotonic.js");

/**

 * @file Classifies transport endings by network phase and probable ownership.

 * @description

 * The Awtsmoos distinguishes DNS, TCP, TLS, proxy, protocol, reset, timeout, and

 * remote socket silence so Awtsmoos.com heals the correct layer. A bare close is

 * retryable transport testimony, never invented proof that auth or runtime failed.

 */

function classify(input, phase = "unknown") {

if (input?.transportFailure) {

return input.transportFailure;

}

  const code = String(input?.code || "").trim();

  const message = String(input?.message || input || "transport_failure").trim();

  const normalized = `${code} ${message}`.toLowerCase();

  const category = categoryFor(normalized, phase);

return {

at: new Date().toISOString(),

// B12: monotonic-domain stamp for elapsed math (cadence, quiet periods).
// `at` above stays wall-clock for human display only.
atMono: Monotonic.monotonicMs(),

category,

phase: phaseFor(category, phase),

  code: code || codeFor(category, normalized),

message: message.slice(0, 500),

  retryable: !["configuration", "certificate", "protocol"].includes(category),

  upstreamLikely: ["dns", "network", "proxy", "reset", "socket", "timeout"].includes(category),

localLikely: ["liveness", "configuration"].includes(category)

};

}

function categoryFor(value, phase) {

// Transport testimony arrives with underscores (remote_close_1000) or spaces
// (remote close); normalize separators before matching so a clean server close
// is recognized as a socket ending, not an unknown one.

  const text = String(value || "").replace(/_/g, " ");

  if (/invalid device credential/.test(text)) return "authentication";

  if (/enotfound|eai again|dns/.test(text)) return "dns";

  if (/cert |err tls |certificate|self signed/.test(text)) return "certificate";

  if (/502|503|504|bad gateway|service unavailable|gateway timeout/.test(text)) return "proxy";

  if (/ehostunreach|enetunreach|econnrefused/.test(text)) return "network";

  if (/econnreset|epipe|socket hang up|transport reset/.test(text)) return "reset";

  if (/socket closed|websocket closed|remote close|connection closed/.test(text)) return "socket";

  if (/etimedout|timeout|idle timeout/.test(text)) return "timeout";

  if (/handshake rejected|accept mismatch|frame|protocol/.test(text)) return "protocol";

  if (/unsupported websocket protocol|invalid url/.test(text)) return "configuration";

  if (/event loop|scheduler|stall/.test(text)) return "liveness";

  if (phase === "tls") return "certificate";

  if (phase === "connect") return "network";

return "unknown";

}

function phaseFor(category, fallback) {

  if (category === "authentication") return "registration";

  if (category === "dns") return "dns";

  if (category === "certificate") return "tls";

  if (category === "proxy" || category === "protocol") return "websocket_handshake";

  if (["network", "reset", "socket", "timeout"].includes(category)) {

  return fallback === "unknown" ? "socket" : fallback;

}

  if (category === "liveness") return "liveness";

return fallback;

}

function codeFor(category, value = "") {

  if (category === "authentication" && /invalid device credential/.test(String(value).replace(/_/g, " "))) {

    return "invalid_device_credential";

  }

  return `transport_${category}`;

}

module.exports = { categoryFor, classify, codeFor, phaseFor };
