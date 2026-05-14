
// B"H

async function openApi($i) {
  $i.response.setHeader("Content-Type", "text/yaml; charset=utf-8");
  $i.response.setHeader("Cache-Control", "no-store");

  return `openapi: 3.1.0
info:
  title: Awtsmoos Tunnel Control
  version: 1.1.0
servers:
  - url: https://awtsmoos.com
paths:
  /api/tunnel/control/fs/{tunnelName}:
    get:
      operationId: awtsmoosTunnel
      summary: Control the user's local Awtsmoos tunnel agent.
      security:
        - OAuth2: []
      parameters:
        - name: tunnelName
          in: path
          required: true
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
          schema:
            type: string
        - name: paths64
          in: query
          required: false
          schema:
            type: string
          description: Base64 JSON array of paths for bulk read.
        - name: files64
          in: query
          required: false
          schema:
            type: string
          description: Base64 JSON object for bulkWrite.
        - name: content64
          in: query
          required: false
          schema:
            type: string
        - name: command64
          in: query
          required: false
          schema:
            type: string
          description: Base64 UTF-8 terminal command for commandRun.
        - name: shell
          in: query
          required: false
          schema:
            type: string
        - name: cwd
          in: query
          required: false
          schema:
            type: string
        - name: url
          in: query
          required: false
          schema:
            type: string
        - name: selector
          in: query
          required: false
          schema:
            type: string
        - name: text64
          in: query
          required: false
          schema:
            type: string
        - name: expression64
          in: query
          required: false
          schema:
            type: string
        - name: script64
          in: query
          required: false
          schema:
            type: string
          description: Base64 JSON array of browser steps.
      responses:
        "200":
          description: Tunnel response.
          content:
            application/json:
              schema:
                type: object
components:
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
            tunnel.command: Run terminal commands.
            tunnel.browser: Control Chrome DevTools.
            tunnel.admin: Full tunnel control.
`;
}

module.exports = { openApi };
