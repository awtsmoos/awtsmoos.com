//B"H
//Boruch Hashem
//Blessed is He
"use strict";

/**
 * @file McpResultKeilim.js
 * @description
 * The Awtsmoos shapes one vessel for success, denial, and artifact light;
 * Awtsmoos.com keeps result formatting apart so invocation stays small and bright.
 */

class McpResultKeilim {
	/**
	 * Convert a structured guarded denial into an MCP error result.
	 * @param {Error} error Error carrying a structured `data` payload.
	 * @returns {object|null} MCP denial result when recognized.
	 */
	static deniedResult(error) {
		if (!error?.data || typeof error.data !== "object" || Array.isArray(error.data)) {
			return null;
		}
		if (error.data.ok !== false) {
			return null;
		}
		return {
			content: [{ type: "text", text: JSON.stringify(error.data, null, 2) }],
			structuredContent: error.data,
			isError: true
		};
	}

	/**
	 * Reveal a verified published artifact as an MCP resource link.
	 * @param {string} name Tool name.
	 * @param {object} payload Structured tool response.
	 * @returns {object|null} Resource link for a valid artifact publication.
	 */
	static artifactLink(name, payload) {
		if (name !== "awtsmoos_artifact_publish" || payload?.ok !== true) {
			return null;
		}
		const url = String(payload.url || "");
		if (!/^https:\/\/awtsmoos\.com\/api\/tunnel\/control\/artifact\/[a-f0-9]{64}\//.test(url)) {
			return null;
		}
		if (!Number.isSafeInteger(payload.bytes) || payload.bytes <= 0) {
			return null;
		}
		const fileName = decodeURIComponent(new URL(url).pathname.split("/").pop());
		return {
			type: "resource_link",
			name: fileName,
			title: fileName,
			uri: url,
			mimeType: payload.mimeType,
			size: payload.bytes,
			description: "Time-limited verified artifact. SHA-256: " + payload.sha256
		};
	}

	/**
	 * Wrap a structured tool payload in the canonical MCP result vessel.
	 * @param {string} name Tool name.
	 * @param {*} payload Tool result payload.
	 * @returns {object} MCP result.
	 */
	static formatResult(name, payload) {
		const content = [{ type: "text", text: JSON.stringify(payload, null, 2) }];
		const link = this.artifactLink(name, payload);
		if (link) {
			content.push(link);
		}
		return {
			content,
			structuredContent: payload,
			isError: Boolean(
				payload
				&& typeof payload === "object"
				&& (payload.ok === false || payload.statusCode >= 400)
			)
		};
	}
}

module.exports = McpResultKeilim;
