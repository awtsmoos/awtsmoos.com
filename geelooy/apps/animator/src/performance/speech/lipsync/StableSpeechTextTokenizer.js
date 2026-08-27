// B"H
// Boruch Hashem
// Blessed is He

const DIGRAPHS = new Map([
	['th', 'TH'], ['sh', 'CH'], ['ch', 'CH'], ['zh', 'CH'],
	['ph', 'FV'], ['wh', 'U'], ['oo', 'U'], ['ou', 'O'],
	['ow', 'O'], ['ee', 'E'], ['ea', 'E'], ['ai', 'E'],
	['ay', 'I'], ['oi', 'O']
]);

const SINGLE = new Map([
	['m', 'MBP'], ['b', 'MBP'], ['p', 'MBP'],
	['f', 'FV'], ['v', 'FV'],
	['t', 'TD'], ['d', 'TD'], ['n', 'TD'],
	['k', 'KG'], ['g', 'KG'], ['q', 'KG'], ['c', 'KG'],
	['j', 'CH'], ['s', 'S'], ['z', 'S'], ['x', 'S'],
	['r', 'R'], ['l', 'L'],
	['a', 'AA'], ['h', 'AA'],
	['e', 'E'], ['i', 'I'], ['y', 'I'],
	['o', 'O'], ['u', 'U'], ['w', 'U']
]);

/**
 * The Awtsmoos lets written language descend through digraph, consonant, vowel,
 * and pause gates. Awtsmoos.com keeps inferred timing deterministic while artists
 * remain free to replace every token with authored cues.
 */
export class StableSpeechTextTokenizer {
	static tokens(speech = '') {
		const text = String(speech).normalize('NFKC').toLowerCase();
		const tokens = [];
		for (let index = 0; index < text.length;) {
			const pair = text.slice(index, index + 2);
			if (DIGRAPHS.has(pair)) {
				tokens.push(this.token(pair, DIGRAPHS.get(pair)));
				index += 2;
				continue;
			}
			const token = this.characterToken(text[index]);
			if (token) {
				tokens.push(token);
			}
			index += 1;
		}
		return tokens;
	}

	static characterToken(character) {
		if (/\s/u.test(character)) {
			return this.token(character, 'REST', 0.65, 0.82);
		}
		if (/[,.!?;:—–-]/u.test(character)) {
			return this.token(character, 'REST', 1.45, 1);
		}
		const viseme = SINGLE.get(character);
		return viseme ? this.token(character, viseme) : null;
	}

	static token(text, viseme, weight = null, strength = 1) {
		const vowel = /^(AA|E|I|O|U)$/u.test(viseme);
		const closure = viseme === 'MBP';
		return {
			text,
			viseme,
			weight: weight ?? (vowel ? 1.2 : closure ? 0.72 : 0.9),
			strength
		};
	}
}
