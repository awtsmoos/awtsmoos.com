
// B"H

const getProperContent = require("../getProperContent.js");
const { normalizeDynamicReturn } = require("./normalizeDynamicResponse.js");
const { maybeFileStatusResponse } = require("./statusRequest.js");

async function buildAwtsmoosResponse({ dyn, derechPath, request, fs }) {
  const status = await maybeFileStatusResponse({ request, fs, derechPath });

  if (status) return status;

  const normalized = normalizeDynamicReturn(dyn);

  let responseType = normalized.mimeType || normalized.headers["Content-Type"] || "";
  let actualResponse = null;

  try {
    actualResponse = getProperContent(normalized.body, responseType);
  } catch (e) {
    responseType = "application/json; charset=utf-8";
    actualResponse = {
      content: JSON.stringify({
        BH: "B\"H",
        ok: false,
        error: "get_proper_content_failed",
        details: e.stack || String(e)
      }, null, 2)
    };
  }

  return {
    responseType,
    actualResponse,
    statusCode: normalized.statusCode || 200,
    headers: normalized.headers || {}
  };
}

module.exports = { buildAwtsmoosResponse };
