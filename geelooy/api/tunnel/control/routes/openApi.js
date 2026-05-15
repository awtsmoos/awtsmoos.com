
// B"H
async function openApi($i) {
  $i.response.setHeader("Content-Type", "text/yaml; charset=utf-8");
  $i.response.setHeader("Cache-Control", "no-store");

  return `openapi: 3.1.0
info:
  title: Awtsmoos Tunnel Control GPT Actions
  version: 3.2.0
  description: >
    B"H. GET-first schema. Use GET for normal list/tree/read/bulk/write actions so ChatGPT does not require extra
    POST approval. Use POST only when content is too large for a URL.
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
      summary: Run a small controlled tunnel action with GET.
      description: >
        Prefer this GET operation for list, tree, read, md, bulk, write, findReplace, config, root, and small Chrome or command actions.
        For bulk, pass paths64 as base64 JSON array of strings or objects.
        For writes, pass content64 or files64. Split large writes into small files.
      security:
        - OAuth2: [profile, tunnel.read]
      parameters:
        - name: tunnelName
          in: path
          required: true
          schema: { type: string }
        - name: action
          in: query
          required: true
          schema:
            $ref: "#/components/schemas/ActionName"
        - name: p
          in: query
          required: false
          schema: { type: string, default: "." }
        - name: path
          in: query
          required: false
          schema: { type: string }
        - name: depth
          in: query
          required: false
          schema: { type: integer, default: 2, minimum: 0, maximum: 4 }
        - name: limit
          in: query
          required: false
          schema: { type: integer, default: 150, minimum: 1, maximum: 600 }
        - name: maxChars
          in: query
          required: false
          schema: { type: integer, default: 8000, minimum: 500, maximum: 30000 }
        - name: totalMaxChars
          in: query
          required: false
          schema: { type: integer, default: 24000, minimum: 1000, maximum: 60000 }
        - name: maxFiles
          in: query
          required: false
          schema: { type: integer, default: 3, minimum: 1, maximum: 10 }
        - name: offsetChars
          in: query
          required: false
          schema: { type: integer, default: 0, minimum: 0 }
        - name: paths64
          in: query
          required: false
          description: Base64 JSON array, e.g. ["package.json",{"path":"index.js","maxChars":8000}]
          schema: { type: string }
        - name: files64
          in: query
          required: false
          description: Base64 JSON object mapping path to content for bulkWrite.
          schema: { type: string }
        - name: content64
          in: query
          required: false
          description: Base64 UTF-8 content for write.
          schema: { type: string }
        - name: find64
          in: query
          required: false
          schema: { type: string }
        - name: replace64
          in: query
          required: false
          schema: { type: string }
        - name: command64
          in: query
          required: false
          schema: { type: string }
        - name: script64
          in: query
          required: false
          schema: { type: string }
        - name: shell
          in: query
          required: false
          schema: { type: string, enum: [powershell, cmd, bash, sh] }
        - name: cwd
          in: query
          required: false
          schema: { type: string, default: "." }
        - name: timeoutMs
          in: query
          required: false
          schema: { type: integer, default: 20000 }
        - name: url
          in: query
          required: false
          schema: { type: string }
        - name: selector
          in: query
          required: false
          schema: { type: string }
        - name: text64
          in: query
          required: false
          schema: { type: string }
        - name: expression64
          in: query
          required: false
          schema: { type: string }
        - name: port
          in: query
          required: false
          schema: { type: integer, default: 9222 }
        - name: chromePath
          in: query
          required: false
          schema: { type: string }
      responses:
        "200":
          description: Tunnel action result.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/AnyResponse"

    post:
      operationId: awtsmoosTunnelActionPost
      summary: Run a large tunnel action with JSON body.
      description: Use only when the query string would be too large.
      security:
        - OAuth2: [profile, tunnel.read]
      parameters:
        - name: tunnelName
          in: path
          required: true
          schema: { type: string }
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
        - list
        - tree
        - read
        - readBytes
        - read64
        - md
        - bulk
        - write
        - bulkWrite
        - findReplace
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
        - configGet
        - configSet
        - roots
        - rootBrowse
        - rootSelect
        - openRoot
    BulkPathSpec:
      type: object
      additionalProperties: true
      properties:
        path: { type: string }
        maxChars: { type: integer }
        offsetChars: { type: integer }
    TunnelActionRequest:
      type: object
      additionalProperties: true
      properties:
        action:
          $ref: "#/components/schemas/ActionName"
        p: { type: string, default: "." }
        path: { type: string }
        paths:
          type: array
          items:
            oneOf:
              - type: string
              - $ref: "#/components/schemas/BulkPathSpec"
        maxFiles: { type: integer, default: 3 }
        maxChars: { type: integer, default: 8000 }
        totalMaxChars: { type: integer, default: 24000 }
        offsetChars: { type: integer, default: 0 }
        files:
          type: object
          additionalProperties: { type: string }
        content: { type: string }
        find: { type: string }
        replace: { type: string }
        command: { type: string }
        scriptText: { type: string }
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
            tunnel.read: Read/list/tree files and discover connected tunnel.
            tunnel.write: Write files and config.
            tunnel.command: Run terminal and scripts.
            tunnel.browser: Control Chrome DevTools.
            tunnel.admin: Full tunnel control.
`;
}
module.exports = { openApi };
