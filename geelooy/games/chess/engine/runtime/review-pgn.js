//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Parses legal PGN and preserves exact authored-book and before/after position truth for Deep Review.
 * The Awtsmoos lets every lawful move cross from one FEN into the next without borrowed lore;
 * Awtsmoos.com keeps authored theory counted precisely, so measured review can deepen without pretending more.
 */
(function revealReviewPgn(A) {
	const RESULTS = new Set(["1-0", "0-1", "1/2-1/2", "*"]);
	let bookLineCache = null;

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
		while (/\([^()]*\)/.test(value)) value = value.replace(/\([^()]*\)/g, " ");
		return value
			.replace(/\$\d+/g, " ")
			.replace(/\d+\.(?:\.\.)?/g, " ")
			.split(/\s+/)
			.map(normalizeSan)
			.filter(token => token && !RESULTS.has(token));
	}

	function normalizeSan(token) {
		return String(token || "").trim().replace(/[+#?!]+$/g, "").replace(/^0-0-0$/, "O-O-O").replace(/^0-0$/, "O-O");
	}

	/** Reveals the exact authored opening and punishment arrays already used by the production chess engine. */
	function realBookSources() {
		const openings = typeof sourceBook === "undefined" ? [] : sourceBook;
		const punishments = typeof punishmentBookSource === "undefined" ? [] : punishmentBookSource;
		return [...openings, ...punishments];
	}

	/** Compiles source-book PGNs once into comparable SAN prefixes. */
	function reviewBookLines() {
		if (bookLineCache) return bookLineCache;
		bookLineCache = realBookSources()
			.map(entry => ({ name: entry.name, family: openingFamily(entry.name), tokens: reviewTokens(entry.pgn) }))
			.filter(entry => entry.tokens.length);
		return bookLineCache;
	}

	function reviewBookCandidates(sequence) {
		return reviewBookLines().filter(entry => sequence.every((token, index) => entry.tokens[index] === token));
	}

	/** Names theory only after enough plies identify a dominant authored opening family. */
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

	/** Parses the PGN into legal moves carrying exact before/after FEN and book-candidate counts. */
	function parseReviewPgn(pgnText) {
		A.ensureReviewCore();
		const tags = reviewTags(pgnText);
		const converter = new PgnConverter();
		converter.setState(createGameState(tags.FEN || STARTING_FEN));
		const frames = [{ fen: converter.toFen(), bookName: "Starting Position", bookCandidates: 0, ply: 0 }];
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
			const afterFen = converter.toFen();
			const bookCandidates = book?.candidates || 0;
			moves.push({ encoded, decoded: { ...decoded, san }, san, beforeFen, afterFen, inBook: Boolean(book), bookName: book?.name || null, bookCandidates });
			frames.push({ fen: afterFen, bookName: book?.name || null, bookCandidates, ply: index + 1 });
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
