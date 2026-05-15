// B"H
const { actions } = require("../docs/actions.js");

function actionEnumYaml(indent = "        ") {
  return actions.map(action => indent + "- " + action).join("\n");
}

/**
 * B"H
 * Serves a compact OpenAPI document whose action enum is drawn from the same catalog as docs.
 *
 * @param {object} $i Awtsmoos request context.
 * @returns {string} YAML OpenAPI schema.
 */
async function openApi($i) {
  $i.response.setHeader("Content-Type", "text/yaml; charset=utf-8");
  $i.response.setHeader("Cache-Control", "no-store");

  return `openapi: 3.1.0
info:
  title: Awtsmoos Tunnel Control GPT Actions
  version: 4.1.0
  description: >
    B"H. GET-first tunnel actions. Use base64 query params for large values.
    Long local commands are bounded to four minutes. Browser actions can run
    headless and return console/runtime/network logs.
servers:
  - url: https://awtsmoos.com
paths:
  /api/tunnel/control/bootstrap:
    get:
      operationId: awtsmoosBootstrap
      summary: Get setup instructions.
      security: []
      responses:
        "200":
          description: Bootstrap response.
          content:
            application/json:
              schema: { $ref: "#/components/schemas/AnyResponse" }

  /api/tunnel/control/my-device:
    get:
      operationId: awtsmoosMyDevice
      summary: Discover the signed-in user's active tunnel.
      security:
        - OAuth2: [profile, tunnel.read]
      responses:
        "200":
          description: Active tunnel discovery result.
          content:
            application/json:
              schema: { $ref: "#/components/schemas/AnyResponse" }

  /api/tunnel/control/fs/{tunnelName}:
    get:
      operationId: awtsmoosTunnelAction
      summary: Run a tunnel action with GET query parameters.
      description: >
        GET supports every tunnel action. For arrays, objects, scripts, commands,
        text, file content, and expressions, use base64 query params.
      security:
        - OAuth2: [profile, tunnel.read]
      parameters:
        - { name: tunnelName, in: path, required: true, schema: { type: string } }
        - { name: action, in: query, required: true, schema: { $ref: "#/components/schemas/ActionName" } }
        - { name: p, in: query, required: false, schema: { type: string, default: "." } }
        - { name: path, in: query, required: false, schema: { type: string } }
        - { name: absolutePath, in: query, required: false, schema: { type: string } }
        - { name: root, in: query, required: false, schema: { type: string } }
        - { name: depth, in: query, required: false, schema: { type: integer, default: 2 } }
        - { name: limit, in: query, required: false, schema: { type: integer, default: 150 } }
        - { name: maxChars, in: query, required: false, schema: { type: integer, default: 12000 } }
        - { name: totalMaxChars, in: query, required: false, schema: { type: integer, default: 24000 } }
        - { name: maxFiles, in: query, required: false, schema: { type: integer, default: 5 } }
        - { name: offsetChars, in: query, required: false, schema: { type: integer, default: 0 } }
        - { name: maxBytes, in: query, required: false, schema: { type: integer, default: 24000 } }
        - { name: offsetBytes, in: query, required: false, schema: { type: integer, default: 0 } }
        - { name: startLine, in: query, required: false, schema: { type: integer, default: 1 } }
        - { name: endLine, in: query, required: false, schema: { type: integer, default: 250 } }
        - { name: maxResults, in: query, required: false, schema: { type: integer, default: 80 } }
        - { name: maxFileBytes, in: query, required: false, schema: { type: integer, default: 800000 } }
        - { name: paths64, in: query, required: false, schema: { type: string } }
        - { name: files64, in: query, required: false, schema: { type: string } }
        - { name: writes64, in: query, required: false, schema: { type: string } }
        - { name: edits64, in: query, required: false, schema: { type: string } }
        - { name: content64, in: query, required: false, schema: { type: string } }
        - { name: find64, in: query, required: false, schema: { type: string } }
        - { name: query64, in: query, required: false, schema: { type: string } }
        - { name: replace64, in: query, required: false, schema: { type: string } }
        - { name: regex, in: query, required: false, schema: { type: boolean, default: false } }
        - { name: replaceAll, in: query, required: false, schema: { type: boolean, default: true } }
        - { name: command64, in: query, required: false, schema: { type: string } }
        - { name: script64, in: query, required: false, schema: { type: string } }
        - { name: input64, in: query, required: false, schema: { type: string } }
        - { name: shell, in: query, required: false, schema: { type: string, enum: [powershell, cmd, bash, sh] } }
        - { name: cwd, in: query, required: false, schema: { type: string, default: "." } }
        - { name: timeoutMs, in: query, required: false, schema: { type: integer, default: 240000 } }
        - { name: url, in: query, required: false, schema: { type: string } }
        - { name: selector, in: query, required: false, schema: { type: string } }
        - { name: text64, in: query, required: false, schema: { type: string } }
        - { name: expression64, in: query, required: false, schema: { type: string } }
        - { name: script64, in: query, required: false, schema: { type: string } }
        - { name: port, in: query, required: false, schema: { type: integer, default: 9222 } }
        - { name: chromePath, in: query, required: false, schema: { type: string } }
        - { name: userDataDir, in: query, required: false, schema: { type: string } }
        - { name: headless, in: query, required: false, schema: { type: boolean, default: false } }
        - { name: clearLogs, in: query, required: false, schema: { type: boolean, default: false } }
        - { name: snapshot, in: query, required: false, schema: { type: boolean, default: true } }
        - { name: maxLogs, in: query, required: false, schema: { type: integer, default: 200 } }
        - { name: waitMs, in: query, required: false, schema: { type: integer, default: 0 } }
        - { name: maxText, in: query, required: false, schema: { type: integer, default: 4000 } }
        - { name: maxHtml, in: query, required: false, schema: { type: integer, default: 0 } }
        - { name: tools64, in: query, required: false, schema: { type: string } }
        - { name: chrome64, in: query, required: false, schema: { type: string } }
        - { name: commandConfig64, in: query, required: false, schema: { type: string } }
      responses:
        "200":
          description: Tunnel action result.
          content:
            application/json:
              schema: { $ref: "#/components/schemas/AnyResponse" }

components:
  schemas:
    ActionName:
      type: string
      enum:
${actionEnumYaml("        ")}
    AnyResponse:
      type: object
      additionalProperties: true
      properties:
        ok: { type: boolean }
        error: { type: string }
        BH: { type: string }

  securitySchemes:
    OAuth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://awtsmoos.com/api/oauth/authorize
          tokenUrl: https://awtsmoos.com/api/oauth/token
          scopes:
            profile: Basic profile.
            tunnel.read: Read/list/tree/search files and discover connected tunnel.
            tunnel.write: Write/config/root changes.
            tunnel.command: Run approved commands, node scripts, and node syntax checks.
            tunnel.browser: Control Chrome and read browser logs.
            tunnel.admin: Full tunnel control.
`;
}

module.exports = { openApi };
