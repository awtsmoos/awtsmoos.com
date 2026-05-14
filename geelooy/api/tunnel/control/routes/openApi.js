
// B"H

async function openApi($i) {
  $i.response.setHeader("Content-Type", "text/yaml; charset=utf-8");
  $i.response.setHeader("Cache-Control", "no-store");

  return `openapi: 3.1.0
info:
  title: Awtsmoos Tunnel Control
  version: 1.3.0
servers:
  - url: https://awtsmoos.com
paths:
  /api/tunnel/control/fs/{tunnelName}:
    get:
      operationId: awtsmoosTunnelAction
      summary: Run a controlled action through the user's local Awtsmoos tunnel agent.
      description: List/read/write files, run sandboxed scripts, run approved terminal commands, or control Chrome through the user's local tunnel.
      security:
        - OAuth2:
            - profile
            - tunnel.read
      parameters:
        - name: tunnelName
          in: path
          required: true
          description: The connected tunnel name shown in the Awtsmoos control panel.
          schema:
            type: string
        - name: action
          in: query
          required: true
          schema:
            type: string
            enum:
              - list
              - tree
              - read
              - md
              - bulk
              - write
              - bulkWrite
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
        - name: p
          in: query
          required: false
          description: Relative path inside the approved root.
          schema:
            type: string
            default: "."
        - name: depth
          in: query
          required: false
          schema:
            type: integer
            default: 2
        - name: limit
          in: query
          required: false
          schema:
            type: integer
            default: 150
        - name: maxChars
          in: query
          required: false
          schema:
            type: integer
            default: 12000
        - name: paths64
          in: query
          required: false
          description: Base64 JSON array of relative paths for bulk read.
          schema:
            type: string
        - name: files64
          in: query
          required: false
          description: Base64 JSON object mapping relative paths to content for bulkWrite.
          schema:
            type: string
        - name: content64
          in: query
          required: false
          description: Base64 UTF-8 file content for write.
          schema:
            type: string
        - name: command64
          in: query
          required: false
          description: Base64 UTF-8 terminal command for commandRun.
          schema:
            type: string
        - name: script64
          in: query
          required: false
          description: For nodeScriptRun this is Base64 JavaScript text. For chromeRunScript this is Base64 JSON array of browser steps.
          schema:
            type: string
        - name: input64
          in: query
          required: false
          description: Base64 JSON input object for nodeScriptRun.
          schema:
            type: string
        - name: shell
          in: query
          required: false
          schema:
            type: string
            enum: [powershell, cmd, bash, sh]
        - name: cwd
          in: query
          required: false
          description: Working directory inside the approved root for commandRun.
          schema:
            type: string
            default: "."
        - name: url
          in: query
          required: false
          description: URL for Chrome navigation.
          schema:
            type: string
        - name: selector
          in: query
          required: false
          description: CSS selector for Chrome actions.
          schema:
            type: string
        - name: text64
          in: query
          required: false
          description: Base64 UTF-8 text for chromeType.
          schema:
            type: string
        - name: expression64
          in: query
          required: false
          description: Base64 JavaScript expression for chromeEval.
          schema:
            type: string
      responses:
        "200":
          description: Action result from the local tunnel.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/TunnelResponse"
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
components:
  schemas:
    TunnelResponse:
      type: object
      additionalProperties: true
      properties:
        BH:
          type: string
          description: Awtsmoos marker.
        ok:
          type: boolean
          description: Whether the action succeeded.
        action:
          type: string
          description: Action that was performed.
        path:
          type: string
          description: Relative path when relevant.
        content:
          type: string
          description: File content or rendered content when relevant.
        items:
          type: array
          items:
            type: string
          description: Directory listing when relevant.
        detailedItems:
          type: array
          items:
            type: object
            additionalProperties: true
          description: Detailed directory entries.
        files:
          type: object
          additionalProperties: true
          description: Bulk read result.
        result:
          type: object
          additionalProperties: true
          description: Script or browser result.
        stdout:
          type: string
          description: Command stdout.
        stderr:
          type: string
          description: Command stderr.
        error:
          type: string
          description: Error message if failed.
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
            tunnel.read: Read/list/tree files.
            tunnel.write: Write files.
            tunnel.command: Run terminal commands and sandboxed nodeScriptRun.
            tunnel.browser: Control Chrome DevTools.
            tunnel.admin: Full tunnel control.
`;
}

module.exports = { openApi };
