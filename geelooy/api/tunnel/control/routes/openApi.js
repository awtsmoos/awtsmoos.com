
// B"H

async function openApi($i) {
  $i.response.setHeader("Content-Type", "text/yaml; charset=utf-8");
  $i.response.setHeader("Cache-Control", "no-store");

  return `openapi: 3.1.0
info:
  title: Awtsmoos Tunnel Control
  version: 2.1.0
  description: |
    B"H. Public GPT Action schema for connecting ChatGPT to a user's local Awtsmoos Tunnel agent.

    The Awtsmoos Tunnel lets an authorized AI inspect and work with files inside the user's approved local root.
    The agent must inspect real files, use small chunks, avoid giant requests, and never guess project structure.

servers:
  - url: https://awtsmoos.com

paths:
  /api/tunnel/control/bootstrap:
    get:
      operationId: awtsmoosBootstrap
      summary: Get setup instructions and first-use guidance.
      description: Use first in a new conversation to learn how the user should install, restart, or connect the tunnel.
      security: []
      responses:
        "200":
          description: Setup/bootstrap information.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/BootstrapResponse"

  /api/tunnel/control/my-device:
    get:
      operationId: awtsmoosMyDevice
      summary: Discover the signed-in user's active tunnel.
      description: |
        After OAuth sign-in, call this before asking the user for a tunnelName.
        If exactly one tunnel is connected, use the returned tunnelName automatically.
      security:
        - OAuth2:
            - profile
            - tunnel.read
      responses:
        "200":
          description: Connected tunnel discovery result.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MyDeviceResponse"
        "401":
          description: User is not authenticated.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "404":
          description: No connected tunnel.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "409":
          description: Multiple tunnels connected; ask user which tunnelName to use.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"

  /api/tunnel/control/fs/{tunnelName}:
    get:
      operationId: awtsmoosTunnelAction
      summary: Run a small controlled tunnel action.
      description: |
        Use GET for small actions: list, tree, read chunks, read64 chunks, findReplace, commandRun, Chrome actions.
        For big writes, bulkWrite, nodeScriptRun, or chromeRunScript, prefer POST to avoid request-too-large errors.
      security:
        - OAuth2:
            - profile
            - tunnel.read
      parameters:
        - $ref: "#/components/parameters/TunnelName"
        - $ref: "#/components/parameters/Action"
        - $ref: "#/components/parameters/Path"
        - $ref: "#/components/parameters/Depth"
        - $ref: "#/components/parameters/Limit"
        - $ref: "#/components/parameters/MaxChars"
        - $ref: "#/components/parameters/TotalMaxChars"
        - $ref: "#/components/parameters/MaxFiles"
        - $ref: "#/components/parameters/OffsetChars"
        - $ref: "#/components/parameters/MaxBytes"
        - $ref: "#/components/parameters/OffsetBytes"
        - $ref: "#/components/parameters/Paths64"
        - $ref: "#/components/parameters/Files64"
        - $ref: "#/components/parameters/Content64"
        - $ref: "#/components/parameters/Find64"
        - $ref: "#/components/parameters/Replace64"
        - $ref: "#/components/parameters/Regex"
        - $ref: "#/components/parameters/ReplaceAll"
        - $ref: "#/components/parameters/Command64"
        - $ref: "#/components/parameters/Script64"
        - $ref: "#/components/parameters/Input64"
        - $ref: "#/components/parameters/Shell"
        - $ref: "#/components/parameters/Cwd"
        - $ref: "#/components/parameters/TimeoutMs"
        - $ref: "#/components/parameters/Url"
        - $ref: "#/components/parameters/Selector"
        - $ref: "#/components/parameters/Text64"
        - $ref: "#/components/parameters/Expression64"
        - $ref: "#/components/parameters/Port"
        - $ref: "#/components/parameters/ChromePath"
        - $ref: "#/components/parameters/UserDataDir"
      responses:
        "200":
          description: Action result from the local tunnel.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/TunnelResponse"
        "400":
          description: Bad request.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "401":
          description: Missing or invalid authentication.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "403":
          description: Missing scope.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"

    post:
      operationId: awtsmoosTunnelActionPost
      summary: Run a larger controlled tunnel action with JSON body.
      description: |
        Use POST for larger writes, bulkWrite, nodeScriptRun, chromeRunScript, or actions where query strings may be too large.
        If a request is too large, split the change into smaller modules/files and retry in smaller batches.
      security:
        - OAuth2:
            - profile
            - tunnel.read
      parameters:
        - $ref: "#/components/parameters/TunnelName"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/TunnelActionRequest"
      responses:
        "200":
          description: Action result from the local tunnel.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/TunnelResponse"
        "400":
          description: Bad request.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "401":
          description: Missing or invalid authentication.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "403":
          description: Missing scope.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "413":
          description: Request too large; split into smaller modules/chunks.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"

components:
  parameters:
    TunnelName:
      name: tunnelName
      in: path
      required: true
      description: The user's tunnel name. Prefer awtsmoosMyDevice auto-discovery after OAuth instead of asking manually.
      schema:
        type: string

    Action:
      name: action
      in: query
      required: true
      schema:
        $ref: "#/components/schemas/ActionName"

    Path:
      name: p
      in: query
      required: false
      description: Relative path inside the approved local root.
      schema:
        type: string
        default: "."

    Depth:
      name: depth
      in: query
      required: false
      schema:
        type: integer
        default: 2
        minimum: 0
        maximum: 4

    Limit:
      name: limit
      in: query
      required: false
      schema:
        type: integer
        default: 150
        minimum: 1
        maximum: 600

    MaxChars:
      name: maxChars
      in: query
      required: false
      description: Per-file character cap for read/bulk. Use 8000 by default.
      schema:
        type: integer
        default: 8000
        minimum: 500
        maximum: 30000

    TotalMaxChars:
      name: totalMaxChars
      in: query
      required: false
      description: Total character cap across a bulk response. Use 24000 by default.
      schema:
        type: integer
        default: 24000
        minimum: 1000
        maximum: 60000

    MaxFiles:
      name: maxFiles
      in: query
      required: false
      description: Maximum files for one bulk call. Use 3 by default, never more than 5 unless explicitly needed.
      schema:
        type: integer
        default: 3
        minimum: 1
        maximum: 10

    OffsetChars:
      name: offsetChars
      in: query
      required: false
      description: Character offset for chunked reading. Use nextOffsetChars from prior response.
      schema:
        type: integer
        default: 0
        minimum: 0

    MaxBytes:
      name: maxBytes
      in: query
      required: false
      description: Byte cap for readBytes/read64.
      schema:
        type: integer
        default: 24000
        minimum: 512
        maximum: 120000

    OffsetBytes:
      name: offsetBytes
      in: query
      required: false
      description: Byte offset for readBytes/read64. Use nextOffsetBytes from prior response.
      schema:
        type: integer
        default: 0
        minimum: 0

    Paths64:
      name: paths64
      in: query
      required: false
      description: Base64 JSON array of relative paths or chunk specs for bulk.
      schema:
        type: string

    Files64:
      name: files64
      in: query
      required: false
      description: Base64 JSON object mapping relative paths to content for bulkWrite.
      schema:
        type: string

    Content64:
      name: content64
      in: query
      required: false
      description: Base64 UTF-8 content for write.
      schema:
        type: string

    Find64:
      name: find64
      in: query
      required: false
      description: Base64 UTF-8 find text/pattern for findReplace.
      schema:
        type: string

    Replace64:
      name: replace64
      in: query
      required: false
      description: Base64 UTF-8 replacement text for findReplace.
      schema:
        type: string

    Regex:
      name: regex
      in: query
      required: false
      schema:
        type: boolean
        default: false

    ReplaceAll:
      name: replaceAll
      in: query
      required: false
      schema:
        type: boolean
        default: true

    Command64:
      name: command64
      in: query
      required: false
      description: Base64 UTF-8 terminal command for commandRun.
      schema:
        type: string

    Script64:
      name: script64
      in: query
      required: false
      description: Base64 JavaScript text for nodeScriptRun or Base64 JSON array for chromeRunScript.
      schema:
        type: string

    Input64:
      name: input64
      in: query
      required: false
      description: Base64 JSON input object for nodeScriptRun.
      schema:
        type: string

    Shell:
      name: shell
      in: query
      required: false
      schema:
        type: string
        enum:
          - powershell
          - cmd
          - bash
          - sh

    Cwd:
      name: cwd
      in: query
      required: false
      description: Working directory inside the approved root for commandRun.
      schema:
        type: string
        default: "."

    TimeoutMs:
      name: timeoutMs
      in: query
      required: false
      schema:
        type: integer
        default: 20000
        minimum: 1000
        maximum: 30000

    Url:
      name: url
      in: query
      required: false
      description: URL for Chrome navigation.
      schema:
        type: string

    Selector:
      name: selector
      in: query
      required: false
      description: CSS selector for Chrome actions.
      schema:
        type: string

    Text64:
      name: text64
      in: query
      required: false
      description: Base64 UTF-8 text for chromeType.
      schema:
        type: string

    Expression64:
      name: expression64
      in: query
      required: false
      description: Base64 JavaScript expression for chromeEval.
      schema:
        type: string

    Port:
      name: port
      in: query
      required: false
      schema:
        type: integer
        default: 9222

    ChromePath:
      name: chromePath
      in: query
      required: false
      schema:
        type: string

    UserDataDir:
      name: userDataDir
      in: query
      required: false
      schema:
        type: string

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

    BootstrapResponse:
      type: object
      additionalProperties: true
      properties:
        BH:
          type: string
        ok:
          type: boolean
        setupUrl:
          type: string
        controlPanelUrl:
          type: string
        installCommandWindows:
          type: string
        restartCommandWindows:
          type: string
        installCommandMacLinux:
          type: string
        restartCommandMacLinux:
          type: string
        docsHuman:
          type: string
        docsJson:
          type: string
        openapi:
          type: string
        myDevice:
          type: string
        privacyPolicy:
          type: string
        firstUserPrompt:
          type: string
        gptBehavior:
          type: array
          items:
            type: string
      required:
        - ok
        - setupUrl
        - firstUserPrompt

    MyDeviceResponse:
      type: object
      additionalProperties: true
      properties:
        BH:
          type: string
        ok:
          type: boolean
        mode:
          type: string
        tunnelName:
          type: string
        identity:
          type: object
          additionalProperties: true
        device:
          type: object
          additionalProperties: true
        guidance:
          type: string
        error:
          type: string
      required:
        - ok

    BulkPathSpec:
      type: object
      additionalProperties: false
      properties:
        path:
          type: string
        mode:
          type: string
          enum:
            - text
            - bytes
            - text-bytes
            - base64
            - read64
        maxChars:
          type: integer
        offsetChars:
          type: integer
        maxBytes:
          type: integer
        offsetBytes:
          type: integer
      required:
        - path

    TunnelActionRequest:
      type: object
      additionalProperties: true
      properties:
        action:
          $ref: "#/components/schemas/ActionName"
        p:
          type: string
          default: "."
        path:
          type: string
        depth:
          type: integer
          default: 2
        limit:
          type: integer
          default: 150
        maxChars:
          type: integer
          default: 8000
        totalMaxChars:
          type: integer
          default: 24000
        maxFiles:
          type: integer
          default: 3
        offsetChars:
          type: integer
          default: 0
        maxBytes:
          type: integer
          default: 24000
        offsetBytes:
          type: integer
          default: 0
        paths:
          type: array
          items:
            oneOf:
              - type: string
              - $ref: "#/components/schemas/BulkPathSpec"
        files:
          type: object
          additionalProperties:
            type: string
        writes:
          type: array
          items:
            type: object
            additionalProperties: true
        content:
          type: string
        find:
          type: string
        replace:
          type: string
        regex:
          type: boolean
          default: false
        replaceAll:
          type: boolean
          default: true
        command:
          type: string
        scriptText:
          type: string
        input:
          type: object
          additionalProperties: true
        shell:
          type: string
          enum:
            - powershell
            - cmd
            - bash
            - sh
        cwd:
          type: string
        timeoutMs:
          type: integer
        url:
          type: string
        selector:
          type: string
        text:
          type: string
        expression:
          type: string
        script:
          type: array
          items:
            type: object
            additionalProperties: true
        port:
          type: integer
        chromePath:
          type: string
        userDataDir:
          type: string
      required:
        - action

    TunnelResponse:
      type: object
      additionalProperties: true
      properties:
        BH:
          type: string
        type:
          type: string
        id:
          type: string
        ok:
          type: boolean
        action:
          type: string
        path:
          type: string
        root:
          type: string
        absolutePath:
          type: string
        content:
          type: string
        content64:
          type: string
        encoding:
          type: string
        truncated:
          type: boolean
        offsetChars:
          type: integer
        nextOffsetChars:
          type:
            - integer
            - "null"
        offsetBytes:
          type: integer
        nextOffsetBytes:
          type:
            - integer
            - "null"
        returnedChars:
          type: integer
        totalChars:
          type: integer
        returnedBytes:
          type: integer
        totalBytes:
          type: integer
        items:
          type: array
          items:
            type: string
        detailedItems:
          type: array
          items:
            type: object
            additionalProperties: true
        files:
          type: object
          additionalProperties: true
        metadata:
          type: object
          additionalProperties: true
        requestedCount:
          type: integer
        returnedCount:
          type: integer
        skippedCount:
          type: integer
        skippedPaths:
          type: array
          items:
            type: string
        usedChars:
          type: integer
        totalMaxChars:
          type: integer
        fileMaxChars:
          type: integer
        maxFiles:
          type: integer
        partial:
          type: boolean
        stoppedBecause:
          type:
            - string
            - "null"
        message:
          type: string
        guidance:
          type:
            - string
            - "null"
        stdout:
          type: string
        stderr:
          type: string
        logs:
          type: array
          items:
            type: string
        result:
          type: object
          additionalProperties: true
        results:
          type: array
          items:
            type: object
            additionalProperties: true
        error:
          type: string
      required:
        - ok

    ErrorResponse:
      type: object
      additionalProperties: true
      properties:
        BH:
          type: string
        ok:
          type: boolean
        error:
          type: string
        details:
          type: string
        message:
          type: string
        guidance:
          type: string
      required:
        - ok
        - error

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
            tunnel.write: Write files, bulk write, config set, findReplace.
            tunnel.command: Run terminal commands and sandboxed nodeScriptRun.
            tunnel.browser: Control Chrome DevTools.
            tunnel.admin: Full tunnel control.
`;
}

module.exports = { openApi };
