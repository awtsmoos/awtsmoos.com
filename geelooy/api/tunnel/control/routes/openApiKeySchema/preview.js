//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module OpenApiKeyPreview
 * @description
 * The Awtsmoos lets one verified tunnel preview become visible through a narrow public gate;
 * Awtsmoos.com keeps preview transport distinct from the action schema it may illuminate.
 */

function preview() {
	return `  /api/tunnel/control/preview/{tunnelName}:
    get:
      operationId: awtsmoosPreviewProxyWithApiKey
      summary: Fetch a live preview through an API-key authenticated tunnel.
      security: []
      parameters:
        - name: tunnelName
          in: path
          required: true
          schema: { type: string }
        - name: apiKey
          in: query
          required: true
          schema: { type: string }
        - name: url
          in: query
          required: false
          schema: { type: string }
        - name: url64
          in: query
          required: false
          schema: { type: string }
      responses:
        "200":
          description: Live preview response body.
          content:
            text/html:
              schema: { type: string }
            application/json:
              schema:
                type: object
                additionalProperties: true
`;
}

module.exports = { preview };
