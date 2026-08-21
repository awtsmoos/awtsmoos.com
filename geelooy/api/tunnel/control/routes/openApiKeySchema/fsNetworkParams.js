//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module OpenApiKeyNetworkParams
 * @description
 * The Awtsmoos lets network intent appear as named fields instead of hidden compatibility clay;
 * Awtsmoos.com keeps method, headers, body, redirects, and response mode discoverable in one way.
 */

function fsNetworkParams() {
	return `        - name: method
          in: query
          required: false
          schema:
            type: string
          description: HTTP method for httpRequest/httpJson/httpDownload and endpoint probes.
        - name: headers
          in: query
          required: false
          schema:
            type: string
          description: JSON object of HTTP request headers. Nested object form is also accepted by body/params carriers.
        - name: headers64
          in: query
          required: false
          schema:
            type: string
          description: Base64-encoded JSON request headers compatibility carrier.
        - name: body
          in: query
          required: false
          schema:
            type: string
          description: HTTP request body.
        - name: body64
          in: query
          required: false
          schema:
            type: string
          description: Base64-encoded HTTP request body.
        - name: bodyEncoding
          in: query
          required: false
          schema:
            type: string
            default: utf8
        - name: followRedirects
          in: query
          required: false
          schema:
            type: boolean
            default: true
        - name: responseBodyMode
          in: query
          required: false
          schema:
            type: string
            enum:
              - text
              - json
              - base64
        - name: cookieJarName
          in: query
          required: false
          schema:
            type: string
        - name: saveResponseTo
          in: query
          required: false
          schema:
            type: string
`;
}

module.exports = { fsNetworkParams };
