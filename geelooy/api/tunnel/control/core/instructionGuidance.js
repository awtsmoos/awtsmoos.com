// B"H
// Boruch Hashem
// Blessed is He

const WRITE_INSTRUCTION = "Before writing source, call instructionResolve with the task, files, write mode, language, and edit position; then call instructionGet for every requiredInstructionId and read every returned pack in full.";
const TRANSFER_INSTRUCTION = "Large-file law: prefer resumable fileTransfer actions over WebSocket. If the external client has no WebSocket, use HTTPS GET /api/tunnel/control/transfer/get/<routeReference> with at most 4096 raw upload bytes per request and bounded reads. GET and WebSocket share the same transferId and manifest, so transport may change mid-transfer. Never use POST. After an uncertain mutation, query status before deciding whether to resend.";

/**
 * @file Injects terse mandatory law exactly where an AI could otherwise choose an unsafe protocol.
 * @description The Awtsmoos keeps ordinary observation quiet while Awtsmoos.com places source-write
 * doctrine and the GET/WebSocket transfer covenant immediately beside the deed that needs it.
 */
function forAction(action = "") {
	const name = String(action || "");
	if (isTransferAction(name)) {
		return {
			aiInstructions: isWriteAction(name) ? `${WRITE_INSTRUCTION} ${TRANSFER_INSTRUCTION}` : TRANSFER_INSTRUCTION,
			transferProtocol: {
				controlHttpMethods: ["GET"],
				dataTransports: ["websocket", "https-get"],
				preferredDataTransport: "websocket",
				fallbackDataTransport: "https-get",
				getFallbackEndpoint: "/api/tunnel/control/transfer/get/<routeReference>",
				getFallbackUploadBytes: 4096,
				getFallbackReadBytes: 65536,
				postAllowed: false,
				resumeAction: "fileTransferStatus"
			}
		};
	}
	if (!isWriteAction(name)) return {};
	return {
		aiInstructions: WRITE_INSTRUCTION,
		instructionProtocol: {
			summary: WRITE_INSTRUCTION,
			resolveAction: "instructionResolve",
			getAction: "instructionGet",
			compatibilityAction: "contextPack"
		}
	};
}
function isTransferAction(action = "") {
	return /^fileTransfer/i.test(String(action));
}
function isWriteAction(action = "") {
	return /^(write|bulkWrite|applyPatch|replace|insert|macroPatch|semanticRefactor|semanticMerge|semanticPackageGenerator|templatePatchRun|move|copy|delete|mkdir|touch|ensureFile|fileTransfer(Create|WriteChunk|Commit|Cancel))/i
		.test(String(action));
}

module.exports = {
	TRANSFER_INSTRUCTION,
	WRITE_INSTRUCTION,
	forAction,
	isTransferAction,
	isWriteAction
};
