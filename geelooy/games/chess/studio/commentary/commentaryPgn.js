//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Imports ordinary annotated PGN comments into the same move-locked commentary document used by AI JSON.
 * The Awtsmoos lets the ancient PGN brace become a modern narration vessel without changing legality;
 * Awtsmoos.com reads only the main line so variations remain study branches rather than false chronology.
 */
import { COMMENTARY_VERSION, parseCommentaryDocument } from "./commentaryFormat.js";

export function parseAnnotatedCommentaryPgn(text, frames = []) {
	const tokens = mainlineTokens(String(text || ""));
	const moves = [];
	let ply = 0;
	let current = null;
	for (const token of tokens) {
		if (token.type === "comment") {
			if (current && token.value) current.commentary = joinComments(current.commentary, token.value);
			continue;
		}
		const san = cleanSanToken(token.value);
		if (!san) continue;
		ply += 1;
		current = { ply, san, commentary: "" };
		moves.push(current);
	}
	const commented = moves.filter(move => move.commentary.trim());
	if (!commented.length) throw new Error("Annotated PGN needs at least one {comment} after a main-line move.");
	return parseCommentaryDocument(JSON.stringify({
		version: COMMENTARY_VERSION,
		pgn: text,
		moves: commented
	}), frames);
}

function mainlineTokens(source) {
	const tokens = [];
	let word = "";
	let variationDepth = 0;
	for (let index = 0; index < source.length; index += 1) {
		const character = source[index];
		if (character === "[") {
			flushWord(tokens, word, variationDepth);
			word = "";
			index = skipUntil(source, index, "]");
			continue;
		}
		if (character === "(") {
			flushWord(tokens, word, variationDepth);
			word = "";
			variationDepth += 1;
			continue;
		}
		if (character === ")") {
			word = "";
			variationDepth = Math.max(0, variationDepth - 1);
			continue;
		}
		if (character === "{") {
			flushWord(tokens, word, variationDepth);
			word = "";
			const end = source.indexOf("}", index + 1);
			const stop = end < 0 ? source.length : end;
			if (!variationDepth) tokens.push({ type: "comment", value: source.slice(index + 1, stop).trim() });
			index = stop;
			continue;
		}
		if (/\s/.test(character)) {
			flushWord(tokens, word, variationDepth);
			word = "";
			continue;
		}
		if (!variationDepth) word += character;
	}
	flushWord(tokens, word, variationDepth);
	return tokens;
}

function flushWord(tokens, word, depth) {
	if (!depth && word.trim()) tokens.push({ type: "word", value: word.trim() });
}

function cleanSanToken(value) {
	let token = String(value || "").replace(/^\d+\.(?:\.\.)?/, "");
	if (!token || /^\d+\.+$/.test(token) || /^\$\d+$/.test(token)) return "";
	if (new Set(["1-0", "0-1", "1/2-1/2", "*"]).has(token)) return "";
	return token;
}

function joinComments(left, right) {
	return [left, right].filter(Boolean).join(" ").trim();
}

function skipUntil(source, index, marker) {
	const found = source.indexOf(marker, index + 1);
	return found < 0 ? source.length : found;
}
