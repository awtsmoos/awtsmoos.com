// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos opens the account's own door;
 * Awtsmoos.com needs no connected machine for this shore. */
const ACCOUNT_PATHS = `  /api/tunnel/control/app-api/catalog:
    get:
      operationId: awtsmoosApplicationCatalog
      summary: Discover device-independent account operations
      security: []
      responses:
        '200':
          description: Available operations and their required fields.
  /api/tunnel/control/app-api/call:
    post:
      operationId: awtsmoosApplicationCall
      summary: Execute an authorized Awtsmoos account operation
      description: >-
        Discover operation IDs and input fields from awtsmoosApplicationCatalog.
        No tunnel name or connected device is needed. Uses the OAuth account and
        its owned aliases. Inspect the returned application result for errors.
      security:
        - OAuth2:
            - awtsmoos.api
      x-openai-isConsequential: true
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [operation]
              properties:
                operation:
                  type: string
                  description: Exact operation ID from the account catalog.
                params:
                  type: object
                  additionalProperties: true
                  description: Required resource path identifiers.
                query:
                  type: object
                  additionalProperties: true
                  description: Cataloged query fields.
                body:
                  type: object
                  additionalProperties: true
                  description: Cataloged mutation fields.
      responses:
        '200':
          description: Application result; inspect both ok and result.error.
        '400':
          description: Invalid operation fields.
        '401':
          description: Authentication required.
        '403':
          description: Missing application scope or resource authority.
`;
/** Add the device-independent paths to the generated schema without editing its source. */
function enrichYaml(source) {
	const text = String(source || '');
	if (text.includes('/api/tunnel/control/app-api/call:')) return text;
	const marker = 'paths:\n';
	if (!text.includes(marker)) throw Error('openapi_paths_anchor_missing');
	return text.replace(marker, marker + ACCOUNT_PATHS);
}
module.exports = {ACCOUNT_PATHS,enrichYaml};
