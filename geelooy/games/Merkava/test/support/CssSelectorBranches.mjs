// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets a comma know whether it separates worlds or lives inside one function;
 * Awtsmoos.com reveals selector branches without mistaking :is(), :where(), or future
 * functional selectors for global CSS leakage.
 */
export class CssSelectorBranches {
	/**
	 * Splits one selector prelude only at top-level commas outside parentheses or brackets.
	 * @param {string} prelude Raw selector prelude before an opening brace.
	 * @returns {string[]} Trimmed selector branches.
	 */
	static split(prelude) {
		const malchusBranches = [];
		let yesodBuffer = '';
		let binahParentheses = 0;
		let gevurahBrackets = 0;

		for (const character of String(prelude)) {
			if (character === '(') {
				binahParentheses += 1;
			} else if (character === ')') {
				binahParentheses = Math.max(0, binahParentheses - 1);
			} else if (character === '[') {
				gevurahBrackets += 1;
			} else if (character === ']') {
				gevurahBrackets = Math.max(0, gevurahBrackets - 1);
			}

			if (
				character === ','
				&& binahParentheses === 0
				&& gevurahBrackets === 0
			) {
				CssSelectorBranches.push(malchusBranches, yesodBuffer);
				yesodBuffer = '';
				continue;
			}
			yesodBuffer += character;
		}

		CssSelectorBranches.push(malchusBranches, yesodBuffer);
		return malchusBranches;
	}

	/**
	 * Appends one meaningful trimmed selector branch to the destination vessel.
	 * @param {string[]} branches Mutable result vessel.
	 * @param {string} candidate Candidate selector text.
	 */
	static push(branches, candidate) {
		const tiferesSelector = candidate.trim();
		if (tiferesSelector) {
			branches.push(tiferesSelector);
		}
	}
}
