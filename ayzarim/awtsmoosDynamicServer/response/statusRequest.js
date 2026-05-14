
// B"H

const crypto = require("crypto");

async function maybeFileStatusResponse({ request, fs, derechPath }) {
  if (request.method !== "GET" || !request.isAwtsmoosFileStatusRequest) {
    return null;
  }

  const results = {
    logicModified: null,
    dataModified: null,
    stateHash: null
  };

  try {
    const logicStats = await fs.stat(derechPath);
    results.logicModified = logicStats.mtime.getTime();
  } catch (e) {}

  if (request.awtsmoosDataSourceStat) {
    results.dataModified = request.awtsmoosDataSourceStat.mtime.getTime();
  }

  const sessionCookie = request.cookies && request.cookies.awtsmoosKey;

  results.stateHash = sessionCookie
    ? crypto.createHash("sha256").update(sessionCookie).digest("hex")
    : "awtsmoos-logged-out";

  return {
    responseType: "application/json",
    statusResponse: true,
    actualResponse: {
      content: JSON.stringify(results)
    }
  };
}

module.exports = { maybeFileStatusResponse };
