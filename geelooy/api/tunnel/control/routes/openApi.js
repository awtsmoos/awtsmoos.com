
// B"H
async function openApi($i) {
  $i.response.setHeader("Content-Type", "text/yaml; charset=utf-8");
  $i.response.setHeader("Cache-Control", "no-store");

  return `openapi: 3.1.0
info:
  title: Awtsmoos Tunnel Control GPT Actions
  version: 3.3.0
  description: >
    B"H. GET and POST schema for the Awtsmoos tunnel. The schema intentionally avoids artificial maximums.
    Real browsers, proxies, nginx, and the ChatGPT action runner can still reject enormous URLs or responses,
    so use POST for large content and split huge files when the transport itself refuses the request.
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
              schema:
                $ref: "#/components/schemas/AnyResponse"

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
              schema:
                $ref: "#/components/schemas/AnyResponse"

  /api/tunnel/control/fs/{tunnelName}:
    get:
      operationId: awtsmoosTunnelAction
      summary: Run a tunnel action with GET query parameters.
      description: >
        GET supports every tunnel action. For arrays/objects/content, use base64 query parameters:
        paths64, files64, writes64, edits64, content64, find64, replace64, command64, script64,
        text64, expression64, input64, tools64, chrome64, commandConfig64.
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
        - { name: replace64, in: query, required: false, schema: { type: string } }
        - { name: query64, in: query, required: false, schema: { type: string } }
        - { name: regex, in: query, required: false, schema: { type: boolean, default: false } }
        - { name: replaceAll, in: query, required: false, schema: { type: boolean, default: true } }
        - { name: command64, in: query, required: false, schema: { type: string } }
        - { name: script64, in: query, required: false, schema: { type: string } }
        - { name: input64, in: query, required: false, schema: { type: string } }
        - { name: shell, in: query, required: false, schema: { type: string, enum: [powershell, cmd, bash, sh] } }
        - { name: cwd, in: query, required: false, schema: { type: string, default: "." } }
        - { name: timeoutMs, in: query, required: false, schema: { type: integer, default: 20000 } }
        - { name: url, in: query, required: false, schema: { type: string } }
        - { name: selector, in: query, required: false, schema: { type: string } }
        - { name: text64, in: query, required: false, schema: { type: string } }
        - { name: expression64, in: query, required: false, schema: { type: string } }
        - { name: port, in: query, required: false, schema: { type: integer, default: 9222 } }
        - { name: chromePath, in: query, required: false, schema: { type: string } }
        - { name: userDataDir, in: query, required: false, schema: { type: string } }
        - { name: tools64, in: query, required: false, schema: { type: string } }
        - { name: chrome64, in: query, required: false, schema: { type: string } }
        - { name: commandConfig64, in: query, required: false, schema: { type: string } }
      responses:
        "200":
          description: Tunnel action result.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/AnyResponse"

    post:
      operationId: awtsmoosTunnelActionPost
      summary: Run any tunnel action with JSON body.
      description: POST supports every tunnel action and should be used for large writes, bulkWrite, big scripts, and big patches.
      security:
        - OAuth2: [profile, tunnel.read]
      parameters:
        - { name: tunnelName, in: path, required: true, schema: { type: string } }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/TunnelActionRequest"
      responses:
        "200":
          description: Tunnel action result.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/AnyResponse"

components:
  schemas:
    ActionName:
      type: string
      enum:
        - configGet
        - configSet
        - roots
        - rootBrowse
        - rootSelect
        - openRoot
        - stat
        - list
        - tree
        - read
        - readLines
        - readBytes
        - read64
        - md
        - bulk
        - grep
        - write
        - bulkWrite
        - findReplace
        - replaceRange
        - applyPatch
        - commandRun
        - nodeScriptRun
        - chromeFind
        - chromeLaunch
        - chromeStatus
        - chromeNavigate
        - chromeWaitForSelector
        - chromeClick
        - chromeType
        - chromeEval
        - chromeRunScript

    BulkPathSpec:
      type: object
      additionalProperties: true
      properties:
        path: { type: string }
        p: { type: string }
        mode: { type: string }
        maxChars: { type: integer }
        offsetChars: { type: integer }
        maxBytes: { type: integer }
        offsetBytes: { type: integer }

    WriteSpec:
      type: object
      additionalProperties: true
      properties:
        path: { type: string }
        p: { type: string }
        content: { type: string }

    TunnelActionRequest:
      type: object
      additionalProperties: true
      properties:
        action: { $ref: "#/components/schemas/ActionName" }
        p: { type: string, default: "." }
        path: { type: string }
        absolutePath: { type: string }
        root: { type: string }
        paths:
          type: array
          items:
            oneOf:
              - { type: string }
              - { $ref: "#/components/schemas/BulkPathSpec" }
        files:
          type: object
          additionalProperties: { type: string }
        writes:
          type: array
          items: { $ref: "#/components/schemas/WriteSpec" }
        edits:
          type: array
          items:
            type: object
            additionalProperties: true
        depth: { type: integer, default: 2 }
        limit: { type: integer, default: 150 }
        maxChars: { type: integer, default: 12000 }
        totalMaxChars: { type: integer, default: 24000 }
        maxFiles: { type: integer, default: 5 }
        offsetChars: { type: integer, default: 0 }
        maxBytes: { type: integer, default: 24000 }
        offsetBytes: { type: integer, default: 0 }
        startLine: { type: integer, default: 1 }
        endLine: { type: integer, default: 250 }
        maxResults: { type: integer, default: 80 }
        maxFileBytes: { type: integer, default: 800000 }
        content: { type: string }
        find: { type: string }
        replace: { type: string }
        query: { type: string }
        regex: { type: boolean, default: false }
        replaceAll: { type: boolean, default: true }
        command: { type: string }
        scriptText: { type: string }
        input:
          type: object
          additionalProperties: true
        shell:
          type: string
          enum: [powershell, cmd, bash, sh]
        cwd: { type: string, default: "." }
        timeoutMs: { type: integer, default: 20000 }
        url: { type: string }
        selector: { type: string }
        text: { type: string }
        expression: { type: string }
        script:
          type: array
          items:
            type: object
            additionalProperties: true
        port: { type: integer, default: 9222 }
        chromePath: { type: string }
        userDataDir: { type: string }
        tools:
          type: object
          additionalProperties: true
        chrome:
          type: object
          additionalProperties: true
        commandConfig:
          type: object
          additionalProperties: true
      required: [action]

    AnyResponse:
      type: object
      additionalProperties: true
      properties:
        ok: { type: boolean }
        error: { type: string }
        BH: { type: string }
      required: [ok]

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
            tunnel.write: Write, bulkWrite, findReplace, replaceRange, applyPatch, config/root changes.
            tunnel.command: Run terminal and sandboxed node scripts.
            tunnel.browser: Control Chrome DevTools.
            tunnel.admin: Full tunnel control.
`;
}

module.exports = { openApi };
