
// B"H

const { bodyJson } = require("./bodyPayload.js");

function query($i) {
  return $i.paramKinds?.GET || $i.$_GET || {};
}

async function body($i) {
  try {
    if (String($i?.request?.method || "").toUpperCase() !== "POST") return {};
    if (typeof $i.getPostData === "function") await $i.getPostData();
    return bodyJson($i);
  } catch (e) {
    // The outer request reader may already have populated request.body even if
    // its compatibility callback is absent or failed. Preserve that valid body.
    return bodyJson($i);
  }
}

module.exports = { query, body };
