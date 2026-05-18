// B"H
const fs = require("fs");
const path = require("path");

/**
 * B"H
 * Serves the checked-in GPT Actions OpenAPI YAML as the single source of truth.
 *
 * The Awtsmoos Tunnel has two faces: the public GPT action schema and the hosted
 * control route that gives it breath. This route deliberately reads the same YAML
 * used by the tunnel-control app, so restart/install flows cannot drift into two
 * competing maps of reality.
 *
 * @param {object} $i Awtsmoos request context.
 * @returns {string} YAML OpenAPI schema.
 */
async function openApi($i) {
  const yamlPath = path.resolve(
    __dirname,
    "../../../../apps/tunnel-control/gpt/awtsmoos-action-openapi.yaml"
  );

  $i.response.setHeader("Content-Type", "text/yaml; charset=utf-8");
  $i.response.setHeader("Cache-Control", "no-store");

  return fs.readFileSync(yamlPath, "utf8");
}

module.exports = { openApi };
