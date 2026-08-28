//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Parses legal PGN and preserves exact before/after position truth plus separately measured authored-book evidence.
 * The Awtsmoos lets every lawful move cross from one FEN into the next while each source keeps its rightful name;
 * Awtsmoos.com joins legal replay with opening and warning evidence without letting one responsibility swallow the game.
 */
(function revealReviewPgn(A) {
	const RESULTS = new Set(["1-0", "0-1", "1/2-1/2", "*"]);

	/** Extracts transport-safe PGN tags without altering their authored values. */
	function reviewTags(text) {
		const tags = {};
		for (const match of String(text).matchAll(/^\s*\[([A-Za-z0-9_]+)\s+"((?:\\.|[^"])*)"\]\s*$/gm)) {
			tags[match[1]] = match[2].replace(/\\"/g, '"');
		}
		return tags;
	}

	/** Returns normalized main-line SAN after removing comments, NAGs, variations, and results. */
	function reviewTokens(text) {
		let value = String(text).replace(/^\s*\[[^\n]*\]\s*$/gm, " ");
		value = value.replace(/\{[^}]*\}|;[^\n]*/g, " ");
		while (/\([^()]*\)/.test(value)) {
			value = value.replace(/\([^()]*\)/g, " ");
		}
		return value
			.replace(/\$\d+/g, " ")
			.replace(/\d+\.(?:\.\.)?/g, " ")
			.split(/\s+/)
			.map(normalizeSan)
			.filter(token => token && !RESULTS.has(token));
	}

	/** Parses the PGN into legal moves carrying exact FENs and source-kind book evidence. */
	function parseReviewPgn(pgnText) {
		A.ensureReviewCore();
		const tags = reviewTags(pgnText);
		const converter = new PgnConverter();
		converter.setState(createGameState(tags.FEN || STARTING_FEN));
		const frames = [{
			fen: converter.toFen(),
			bookName: "Starting Position",
			bookCandidates: 0,
			ply: 0
		}];
		const moves = [];
		const played = [];
		for (const [index, san] of reviewTokens(pgnText).entries()) {
			const encoded = converter.parseSan(san);
			if (encoded === null) {
				throw new Error(`Illegal or unsupported SAN at ply ${index + 1}: ${san}`);
			}
			const decoded = decodeMove(encoded, converter.currentState.turn);
			const beforeFen = converter.toFen();
			played.push(san);
			const book = A.reviewBookForSequence(played);
			converter.applyMove(encoded);
			const afterFen = converter.toFen();
			const evidence = A.reviewBookEvidence(book);
			moves.push({
				encoded,
				decoded: { ...decoded, san },
				san,
				beforeFen,
				afterFen,
				...evidence
			});
			frames.push({
				fen: afterFen,
				bookName: evidence.bookName,
				bookCandidates: evidence.bookCandidates,
				ply: index + 1
			});
		}
		return Object.freeze({ tags, moves, frames });
	}

	function normalizeSan(token) {
		return String(token || "")
			.trim()
			.replace(/[+#?!]+$/g, "")
			.replace(/^0-0-0$/, "O-O-O")
			.replace(/^0-0$/, "O-O");
	}

	Object.assign(A, {
		reviewTags,
		reviewTokens,
		parseReviewPgn
	});
})(self.AwtsmoosChessUpgrade);
