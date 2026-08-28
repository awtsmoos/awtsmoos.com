//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Separates genuine opening theory from authored punishment and trap-study lines during Deep Review.
 * The Awtsmoos lets a library teach both roads and warnings without confusing praise with a cautionary sign;
 * Awtsmoos.com preserves the source kind, so documented traps can illuminate a blunder without calling the blunder fine.
 */
(function revealReviewBook(A) {
	let bookLineCache = null;

	/** Reveals production opening and punishment libraries with their semantic source kind intact. */
	function reviewBookSources() {
		const openings = typeof sourceBook === "undefined" ? [] : sourceBook;
		const punishments = typeof punishmentBookSource === "undefined" ? [] : punishmentBookSource;
		return [
			...openings.map(entry => ({ entry, kind: "opening" })),
			...punishments.map(entry => ({ entry, kind: "punishment" }))
		];
	}

	/** Compiles authored PGNs once into comparable SAN prefixes without conflating approval and cautionary study. */
	function reviewBookLines() {
		if (bookLineCache) return bookLineCache;
		bookLineCache = reviewBookSources()
			.map(({ entry, kind }) => ({
				name: entry.name,
				family: openingFamily(entry.name),
				kind,
				tokens: A.reviewTokens(entry.pgn)
			}))
			.filter(entry => entry.tokens.length);
		return bookLineCache;
	}

	/** Returns every authored line whose SAN prefix exactly matches the played sequence. */
	function reviewBookCandidates(sequence) {
		return reviewBookLines().filter(entry => {
			return sequence.every((token, index) => entry.tokens[index] === token);
		});
	}

	/** Returns authored evidence while naming theory from genuine opening candidates only. */
	function reviewBookForSequence(sequence) {
		const candidates = reviewBookCandidates(sequence);
		if (!candidates.length) return null;
		const openings = candidates.filter(entry => entry.kind === "opening");
		const punishments = candidates.filter(entry => entry.kind === "punishment");
		return Object.freeze({
			name: sequence.length >= 5 ? dominantOpening(openings) : null,
			candidates: candidates.length,
			openingCandidates: openings.length,
			punishmentCandidates: punishments.length,
			kind: openings.length
				? (punishments.length ? "mixed" : "opening")
				: "punishment"
		});
	}

	/** Converts optional authored evidence into stable fields carried by each reviewed move. */
	function reviewBookEvidence(book) {
		return Object.freeze({
			inBook: Boolean(book?.openingCandidates),
			bookName: book?.name || null,
			bookKind: book?.kind || null,
			bookCandidates: book?.candidates || 0,
			openingCandidates: book?.openingCandidates || 0,
			punishmentCandidates: book?.punishmentCandidates || 0
		});
	}

	function dominantOpening(entries) {
		if (!entries.length) return null;
		const counts = new Map();
		for (const entry of entries) {
			counts.set(entry.family, (counts.get(entry.family) || 0) + 1);
		}
		const ranked = [...counts.entries()].sort((left, right) => right[1] - left[1]);
		const [family, count] = ranked[0] || [];
		return family && count >= 2 && count / entries.length >= 0.55
			? family
			: null;
	}

	function openingFamily(name) {
		const text = String(name || "")
			.replace(/^(?:Punish|Beginner Blunder):\s*/i, "")
			.replace(/^The\s+/i, "");
		const parenthetical = text.match(/\((Ruy Lopez|Spanish[^)]*)\)/i);
		if (parenthetical) {
			return parenthetical[1].replace(/^Spanish.*$/i, "Ruy Lopez");
		}
		return text.split(/[:,]/)[0].trim();
	}

	Object.assign(A, {
		reviewBookSources,
		reviewBookLines,
		reviewBookCandidates,
		reviewBookForSequence,
		reviewBookEvidence
	});
})(self.AwtsmoosChessUpgrade);
