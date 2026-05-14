
// B"H

/**
 * B"H
 * Returns an OpenAPI YAML schema for Custom GPT Actions.
 *
 * The Custom GPT can use OAuth. The action URL is protected by:
 * Authorization: Bearer <OAuth access token>
 *
 * The GPT still needs the tunnelName until account/device pairing is fully
 * completed. The hosted panel generates the exact prompt with tunnelName.
 */
async function openApi($i) {
  $i.response.setHeader("Content-Type", "text/yaml; charset=utf-8");
  $i.response.setHeader("Cache-Control", "no-store");

  const yaml = `openapi: 3.1.0
info:
  title: Awtsmoos Tunnel Control
  version: 1.0.0
servers:
  - url: https://awtsmoos.com
paths:
  /api/tunnel/control/fs/{tunnelName}:
    get:
      operationId: awtsmoosTunnelFs
      summary: Read, list, tree, write, bulk read, bulk write, or configure the user's Awtsmoos local tunnel agent.
      security:
        - OAuth2: []
      parameters:
        - name: tunnelName
          in: path
          required: true
          schema:
            type: string
          description: The local tunnel name from the user's Awtsmoos Tunnel Control page.
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
              - roots
              - configGet
              - configSet
              - openRoot
              - chooseRoot
          description: Filesystem or agent operation.
        - name: p
          in: query
          required: false
          schema:
            type: string
          description: Path relative to the agent root. Use . for root.
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
          schema:
            type: string
          description: Base64 JSON array of paths for bulk read.
        - name: files64
          in: query
          required: false
          schema:
            type: string
          description: Base64 JSON object path-to-content for bulkWrite.
        - name: content64
          in: query
          required: false
          schema:
            type: string
          description: Base64 UTF-8 content for write.
      responses:
        "200":
          description: Tunnel response.
          content:
            application/json:
              schema:
                type: object
                properties:
                  ok:
                    type: boolean
                  action:
                    type: string
                  path:
                    type: string
                  content:
                    type: string
                  items:
                    type: array
                    items:
                      type: string
                  detailedItems:
                    type: array
                    items:
                      type: object
                      properties:
                        name:
                          type: string
                        type:
                          type: string
                        path:
                          type: string
                        isDirectory:
                          type: boolean
                  error:
                    type: string
components:
  securitySchemes:
    OAuth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://awtsmoos.com/api/oauth/authorize
          tokenUrl: https://awtsmoos.com/api/oauth/token
          scopes:
            profile: Basic profile access.
            tunnel.read: Read/list/tree files through the user's local agent.
            tunnel.write: Write files through the user's local agent.
`;

  return {
    mimeType: "text/yaml",
    response: yaml
  };
}

module.exports = { openApi };
