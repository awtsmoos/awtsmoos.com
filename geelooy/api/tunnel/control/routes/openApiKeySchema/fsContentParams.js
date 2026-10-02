//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module OpenApiKeyFsContentParams
 * @description
 * The Awtsmoos lets compact control values cross by GET while great bodies travel in
 * resumable transfer chunks; Awtsmoos.com keeps preview and publication fields first-class.
 */
function fsContentParams() {
	return `        - name: paths64
          in: query
          required: false
          schema: { type: string }
        - name: files64
          in: query
          required: false
          schema: { type: string }
        - name: content64
          in: query
          required: false
          schema: { type: string }
          description: Small inline base64 content only. Use fileTransfer* actions for large content.
        - name: command64
          in: query
          required: false
          schema: { type: string }
        - name: script64
          in: query
          required: false
          schema: { type: string }
        - name: input64
          in: query
          required: false
          schema: { type: string }
        - name: shell
          in: query
          required: false
          schema:
            type: string
            enum: [powershell, cmd, bash, sh]
        - name: cwd
          in: query
          required: false
          schema: { type: string, default: "." }
        - name: url
          in: query
          required: false
          schema: { type: string }
          description: Direct URL for browser navigation and other URL-aware actions.
        - name: selector
          in: query
          required: false
          schema: { type: string }
          description: Direct CSS selector for browser actions.
        - name: text64
          in: query
          required: false
          schema: { type: string }
        - name: expression64
          in: query
          required: false
          schema: { type: string }
        - name: previewTitle
          in: query
          required: false
          schema: { type: string }
        - name: previewVisibility
          in: query
          required: false
          schema: { type: string, enum: [private, public] }
        - name: previewTtlSeconds
          in: query
          required: false
          schema: { type: integer, default: 3600 }
        - name: previewId
          in: query
          required: false
          schema: { type: string }
        - name: transferId
          in: query
          required: false
          schema: { type: string }
        - name: totalBytes
          in: query
          required: false
          schema: { type: integer }
        - name: chunkBytes
          in: query
          required: false
          schema: { type: integer, default: 65536 }
        - name: offset
          in: query
          required: false
          schema: { type: integer, default: 0 }
        - name: expectedSha256
          in: query
          required: false
          schema: { type: string }
        - name: sha256
          in: query
          required: false
          schema: { type: string }
        - name: overwrite
          in: query
          required: false
          schema: { type: boolean, default: true }
`;
}

module.exports = { fsContentParams };
