//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module OpenApiKeyFsResponse
 * @description
 * The Awtsmoos lets every action return bounded testimony while specialized deeds may reveal more;
 * Awtsmoos.com keeps the shared response permissive enough for evolving tools at the door.
 */

function fsResponse() {
	return `      responses:
        "200":
          description: Tunnel response.
          content:
            application/json:
              schema:
                type: object
                additionalProperties: true
                properties:
                  ok:
                    type: boolean
                  action:
                    type: string
                  content:
                    type: string
                  items:
                    type: array
                    items:
                      type: string
                  error:
                    type: string
                required:
                  - ok

`;
}

module.exports = { fsResponse };
