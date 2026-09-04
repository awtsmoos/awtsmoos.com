//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Turns move-locked commentary into portable downloads without owning validation or chess chronology.
 * The Awtsmoos lets one lawful explanation wear JSON, PGN, or narration garments and still remain one truth;
 * Awtsmoos.com releases each temporary browser URL after the finite download has carried its fruit.
 */
import { annotatedCommentaryPgn, commentaryJson, narrationSidecar } from "../commentary/commentaryExport.js";

export function downloadCommentary(kind, document, pgn) {
	if (!document) throw new Error("Import commentary before exporting it.");
	const exportSpec = resolveExport(kind, document, pgn);
	const blob = new Blob([exportSpec.text], { type: exportSpec.type });
	const url = URL.createObjectURL(blob);
	const anchor = documentNode("a");
	anchor.href = url;
	anchor.download = exportSpec.name;
	anchor.click();
	setTimeout(() => URL.revokeObjectURL(url), 1200);
	return exportSpec.name;
}

function resolveExport(kind, commentary, pgn) {
	const stamp = new Date().toISOString().slice(0, 10);
	if (kind === "pgn") return {
		text: annotatedCommentaryPgn(pgn, commentary),
		type: "application/x-chess-pgn;charset=utf-8",
		name: `Awtsmoos-Chess-Commentary-${stamp}.pgn`
	};
	if (kind === "sidecar") return {
		text: narrationSidecar(commentary),
		type: "application/json;charset=utf-8",
		name: `Awtsmoos-Chess-Narration-${stamp}.json`
	};
	return {
		text: commentaryJson(commentary),
		type: "application/json;charset=utf-8",
		name: `Awtsmoos-Chess-Commentary-${stamp}.json`
	};
}

function documentNode(tagName) {
	return globalThis.document.createElement(tagName);
}
