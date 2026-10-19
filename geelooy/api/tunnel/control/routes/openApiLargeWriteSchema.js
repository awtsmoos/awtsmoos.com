// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file openApiLargeWriteSchema.js
 * @description Adds one body-backed large-write covenant to the served Awtsmoos.com OpenAPI document.
 * The Awtsmoos does not stretch a query until it breaks; a dedicated POST vessel receives the heavy word.
 */

const OPERATION_ID = "awtsmoosTunnelLargeWrite";
const PATH_MARKER = "paths:\n";

const LARGE_WRITE_PATH = `  /api/tunnel/control/write-large/{tunnelName}:
    post:
      operationId: awtsmoosTunnelLargeWrite
      summary: Write one large full file through staged transfer
      description: >-
        Replaces one complete file from a JSON request body. The server stages verified
        chunks and publishes them with the existing transfer transaction. Hash-guarded
        writes must continue using their explicit guarded write actions.
      security:
        - OAuth2:
            - tunnel.write
      parameters:
        - name: tunnelName
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - path
              properties:
                path:
                  type: string
                content:
                  type: string
                content64:
                  type: string
                  description: Strict base64 full-file content.
                cwd:
                  type: string
                root:
                  type: string
                verifyJs:
                  type: boolean
                  default: true
                chunkBytes:
                  type: integer
                  minimum: 65536
                  maximum: 2097152
                timeoutMs:
                  type: integer
                targetVessel:
                  type: string
                vessel:
                  type: string
                fallback:
                  type: string
              oneOf:
                - required: [content]
                  not:
                    required: [content64]
                - required: [content64]
                  not:
                    required: [content]
      responses:
        '200':
          description: Large write published.
        '400':
          description: Invalid body or unsupported guarded-write mode.
        '401':
          description: Authentication required.
        '403':
          description: tunnel.write scope required.
        '413':
          description: Decoded file content exceeds 64 MiB.
        '500':
          description: Transfer, publish, or verification failed.
`;

/** Injects the operation once while preserving every generated OpenAPI path verbatim. */
function enrichYaml(source) {
	const text = String(source || "");
	if (text.includes(`operationId: ${OPERATION_ID}`)) {
		return text;
	}

	const index = text.indexOf(PATH_MARKER);
	if (index < 0) {
		throw new Error("openapi_paths_anchor_missing");
	}

	const insertion = index + PATH_MARKER.length;
	return `${text.slice(0, insertion)}${LARGE_WRITE_PATH}${text.slice(insertion)}`;
}

module.exports = {
	LARGE_WRITE_PATH,
	OPERATION_ID,
	enrichYaml
};
