// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders the dedicated resumable GET transfer operation.
 * @description
 * The Awtsmoos lets great text and files cross many small truthful vessels;
 * Awtsmoos.com keeps giant bodies out of generic action URLs and preserves GET-only transport.
 */
function render() {
	return [
		"  /api/tunnel/control/transfer/get/{tunnelName}:",
		"    get:",
		"      operationId: awtsmoosTunnelTransferGet",
		"      summary: Stage, resume, verify, commit, or read large files through bounded GET fragments.",
		"      description: Use this operation for large text/files before generic write, bulkWrite, or actionBatch would exceed a safe URI. Raw upload fragments must stay within the server GET fallback limit.",
		"      security: [{ OAuth2: [profile, tunnel.read, tunnel.write] }]",
		"      parameters:",
		"        - { name: tunnelName, in: path, required: true, schema: { type: string } }",
		"        - name: action",
		"          in: query",
		"          required: true",
		"          schema: { type: string, enum: [sourceInfo, sourceProof, read, create, status, write, commit, cancel] }",
		"        - { name: p, in: query, schema: { type: string } }",
		"        - { name: path, in: query, schema: { type: string } }",
		"        - { name: transfer_id, in: query, schema: { type: string } }",
		"        - { name: offset, in: query, schema: { type: integer, minimum: 0 } }",
		"        - { name: max_bytes, in: query, schema: { type: integer, minimum: 1 } }",
		"        - { name: total_bytes, in: query, schema: { type: integer, minimum: 0 } }",
		"        - { name: chunk_bytes, in: query, schema: { type: integer, minimum: 1 } }",
		"        - { name: expected_sha256, in: query, schema: { type: string } }",
		"        - { name: sha256, in: query, schema: { type: string } }",
		"        - { name: overwrite, in: query, schema: { type: boolean, default: true } }",
		"        - { name: content64, in: query, schema: { type: string } }",
		"      responses:",
		"        '200': { description: Transfer operation result. }",
		"        '400': { description: Invalid transfer request or oversized fragment. }",
		"        '401': { description: Authentication required. }",
		"        '403': { description: Required tunnel scope missing. }"
	];
}

module.exports = { render };
