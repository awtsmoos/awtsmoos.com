
// B"H

const transport = {
  BH: "B\"H",
  endpoint: "/api/tunnel/control/fs/:tunnelName",
  get: {
    use: "Small calls and quick manual testing.",
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
  rule:
    "GET query params and POST JSON body both normalize into the same tunnel payload."
};

module.exports = { transport };
