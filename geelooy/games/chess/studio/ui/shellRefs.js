//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Collects the finite DOM vessels the Studio controller may address without hiding selector magic elsewhere.
 * The Awtsmoos is beyond every id while each id lets one visible control receive its measured task;
 * Awtsmoos.com keeps this registry explicit so future modules can trace their handles without a guessing mask.
 */
const REF_IDS = Object.freeze([
	"Close", "Preview", "Prev", "Play", "Next", "Timeline", "MoveLabel", "Status", "File", "Pgn", "Load",
	"ViewQuick", "Mode", "PreviewMotion", "CanvasStyle", "CanvasPieceStyle", "Theme", "Characters", "Flip", "Coords", "Arrow", "ProceduralOptions",
	"MovieMode", "MovieStyle", "MovieOutput", "MovieMotion", "MovieCamera", "Movie", "MovieCancel", "MovieProgress", "MovieStatus",
	"ReviewStrength", "Review", "ReviewCancel", "ReviewStatus", "ReviewResults",
	"CommentaryPreset", "CommentaryFormat", "CommentaryInstructions", "CommentaryPromptCopy", "CommentaryValidate", "CommentaryImport", "CommentaryClear",
	"CommentaryPrompt", "CommentaryJson", "CommentaryStatus", "CommentaryList", "CommentaryExportJson", "CommentaryExportPgn", "CommentaryExportSidecar",
	"TtsProvider", "TtsCapability", "TtsNote", "TtsDocs", "TtsCredentials", "TtsEndpoint", "TtsKey", "TtsVoice", "TtsModel", "TtsHeaderName", "TtsHeaderPrefix", "TtsBody", "TtsGuide",
	"SpeakCurrent", "SpeakAll", "SpeakStop"
]);

export function collectShellRefs(root) {
	return Object.fromEntries(
		REF_IDS.map(id => [
			id[0].toLowerCase() + id.slice(1),
			root.querySelector(`#studio${id}`)
		])
	);
}
