//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Parses legal PGN and identifies theory from the engine's authored opening-book source without premature variation claims.
 * The Awtsmoos lets written masters speak only when their shared path becomes clear;
 * Awtsmoos.com calls early ambiguity simply “book” until one opening family truly draws near.
 */
(function revealReviewPgn(A) {
	const RESULTS = new Set(["1-0", "0-1", "1/2-1/2", "*"]);
	let bookLineCache = null;

	/** Extracts harmless PGN tags for review, movie, and player labels. */
	function reviewTags(text) {
		const tags = {};
		for (const match of String(text).matchAll(/^\s*\[([A-Za-z0-9_]+)\s+"((?:\\.|[^"])*)"\]\s*$/gm)) {
			tags[match[1]] = match[2].replace(/\\"/g, '"');
		}
		return tags;
	}

	/** Returns normalized main-line SAN without comments, NAGs, results, or variations. */
	function reviewTokens(text) {
		let value = String(text).replace(/^\s*\[[^\n]*\]\s*$/gm, " ");
		value = value.replace(/\{[^}]*\}|;[^\n]*/g, " ");
		while (/\([^()]*\)/.test(value)) value = value.replace(/\([^()]*\)/g, " ");
		return value.replace(/\$\d+/g, " ").replace(/\d+\.(?:\.\.)?/g, " ")
			.split(/\s+/).map(normalizeSan).filter(token => token && !RESULTS.has(token));
	}

	function normalizeSan(token) {
		return String(token || "").trim().replace(/[+#?!]+$/g, "").replace(/^0-0-0$/, "O-O-O").replace(/^0-0$/, "O-O");
	}

	/** Reveals the exact authored opening and punishment arrays from their global lexical bindings. */
	function realBookSources() {
		const openings = typeof sourceBook === "undefined" ? [] : sourceBook;
		const punishments = typeof punishmentBookSource === "undefined" ? [] : punishmentBookSource;
		return [...openings, ...punishments];
	}

	/** Compiles source books into comparable SAN lines once per review worker. */
	function reviewBookLines() {
		if (bookLineCache) return bookLineCache;
		bookLineCache = realBookSources()
			.map(entry => ({ name: entry.name, family: openingFamily(entry.name), tokens: reviewTokens(entry.pgn) }))
			.filter(entry => entry.tokens.length);
		return bookLineCache;
	}

	/** Returns every authored line still compatible with the played prefix. */
	function reviewBookCandidates(sequence) {
		return reviewBookLines().filter(entry => sequence.every((token, index) => entry.tokens[index] === token));
	}

	/** Names an opening only after five plies and a clearly dominant authored family. */
	function reviewBookForSequence(sequence) {
		const candidates = reviewBookCandidates(sequence);
		if (!candidates.length) return null;
		if (sequence.length < 5) return { name: null, candidates: candidates.length };
		const counts = new Map();
		for (const entry of candidates) counts.set(entry.family, (counts.get(entry.family) || 0) + 1);
		const ranked = [...counts.entries()].sort((left, right) => right[1] - left[1]);
		const [family, count] = ranked[0] || [];
		const dominant = family && count >= 2 && count / candidates.length >= 0.55;
		return { name: dominant ? family : null, candidates: candidates.length };
	}

	/** Parses one PGN while preserving before-FEN, book truth, SAN, and legal encoded moves. */
	function parseReviewPgn(pgnText) {
		A.ensureReviewCore();
		const tags = reviewTags(pgnText);
		const converter = new PgnConverter();
		converter.setState(createGameState(tags.FEN || STARTING_FEN));
		const frames = [{ fen: converter.toFen(), bookName: "Starting Position", ply: 0 }];
		const moves = [];
		const played = [];
		for (const [index, san] of reviewTokens(pgnText).entries()) {
			const encoded = converter.parseSan(san);
			if (encoded === null) throw new Error(`Illegal or unsupported SAN at ply ${index + 1}: ${san}`);
			const decoded = decodeMove(encoded, converter.currentState.turn);
			const beforeFen = converter.toFen();
			played.push(san);
			const book = reviewBookForSequence(played);
			converter.applyMove(encoded);
			moves.push({ encoded, decoded: { ...decoded, san }, san, beforeFen, inBook: Boolean(book), bookName: book?.name || null });
			frames.push({ fen: converter.toFen(), bookName: book?.name || null, ply: index + 1 });
		}
		return Object.freeze({ tags, moves, frames });
	}

	function openingFamily(name) {
		const text = String(name || "").replace(/^(?:Punish|Beginner Blunder):\s*/i, "").replace(/^The\s+/i, "");
		const parenthetical = text.match(/\((Ruy Lopez|Spanish[^)]*)\)/i);
		if (parenthetical) return parenthetical[1].replace(/^Spanish.*$/i, "Ruy Lopez");
		return text.split(/[:,]/)[0].trim();
	}

	Object.assign(A, { reviewTags, reviewTokens, reviewBookLines, reviewBookCandidates, reviewBookForSequence, parseReviewPgn });
})(self.AwtsmoosChessUpgrade);
