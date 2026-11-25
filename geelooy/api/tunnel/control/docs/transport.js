
// B"H

const transport = {
  BH: "B\"H",
  endpoint: "/api/tunnel/control/fs/:tunnelName",
  get: {
    use: "Legacy plugin compatibility and small calls. Payload-bearing GET requests (write, commandRun, and friends) are accepted when the request is authenticated with an API key or OAuth bearer — the transports the deployed ChatGPT Shliach plugin can send — up to a 16,384-byte serialized ceiling. Browser-session GET requests stay read-only, so ordinary navigation, prefetch or cross-site embedding can never mutate a device.",
    example:
      "/api/tunnel/control/fs/awt-example?action=list&p=awtsmoos.com"
  },
  post: {
    use: "GPT Actions, larger writes, bulkWrite, scripts, and JSON-native clients.",
    contentType: "application/json",
    example: {
      action: "read",
      p: "awtsmoos.com/package.json",
      maxChars: 8000
    }
  },
  largePayloads:
    "Above the legacy GET ceiling or the 32MB body bound, use the chunked large-write transfer (init, ordered chunks, SHA-256 verification, atomic finalize) instead of a URL.",
  rule:
    "GET query params and POST JSON body both normalize into the same canonical tunnel payload, with the same authorization, validation, execution and audit. All tunnel responses are Cache-Control: no-store."
};

module.exports = { transport };
