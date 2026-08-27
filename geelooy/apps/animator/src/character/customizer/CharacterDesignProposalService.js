// B"H
// Boruch Hashem
// Blessed is He

import { CharacterDesignSchema } from './CharacterDesignSchema.js';

/**
 * AI may propose, but it may not impersonate proof. Awtsmoos.com records the
 * actual provider and falls back to deterministic local design when none exists.
 */
export class CharacterDesignProposalService {
	static async propose(prompt, current = {}) {
		const text = String(prompt || '').trim();
		const provider = globalThis.AwtsmoosCharacterAI;
		if (provider?.designCharacter instanceof Function) {
			const proposed = await provider.designCharacter({
				prompt: text,
				schemaVersion: CharacterDesignSchema.version,
				current
			});
			return CharacterDesignSchema.assert({
				...proposed,
				ai: {
					prompt: text,
					provider: provider.name || 'connected-provider',
					proposed: true,
					approved: false,
					provenance: 'provider-response'
				}
			});
		}

		return CharacterDesignSchema.assert({
			...current,
			...this.local(text),
			ai: {
				prompt: text,
				provider: 'local-deterministic-fallback',
				proposed: true,
				approved: false,
				provenance: 'no-external-provider-connected'
			}
		});
	}

	static local(prompt) {
		const text = prompt.toLowerCase();
		const feminine = /woman|female|feminine|mother|girl/u.test(text);
		const masculine = /man|male|masculine|father|boy/u.test(text);
		const darkSkin = /dark skin|deep skin|brown skin/u.test(text);
		const lightSkin = /light skin|pale skin/u.test(text);
		const longHair = /long hair|braid|ponytail|locs/u.test(text);
		const bald = /bald|shaved head/u.test(text);
		const beard = /long beard|full beard|bearded/u.test(text);
		const mustache = /mustache|moustache/u.test(text);
		const broad = /broad|strong|stocky/u.test(text);
		const tall = /tall|lanky/u.test(text);

		return {
			name: this.name(prompt),
			genderPresentation: feminine
				? 'feminine'
				: masculine ? 'masculine' : 'androgynous',
			body: {
				type: broad ? 'broad' : tall ? 'tall' : 'average'
			},
			skin: {
				color: darkSkin ? '#71452f' : lightSkin ? '#efc7a5' : '#bd7a59'
			},
			hair: {
				length: bald ? 'bald' : longHair ? 'long' : 'short',
				style: this.hairStyle(text)
			},
			facialHair: {
				beard: { style: beard ? 'full' : 'none', length: beard ? 0.75 : 0 },
				mustache: { style: mustache ? 'natural' : 'none', thickness: mustache ? 0.65 : 0 }
			},
			wardrobe: {
				outerwear: /hoodie/u.test(text) ? 'hoodie' : /robe/u.test(text) ? 'robe' : 'jacket',
				headwear: /hat/u.test(text) ? 'hat' : /scarf/u.test(text) ? 'scarf' : 'none'
			},
			movement: {
				profile: /energetic|fast|excited/u.test(text)
					? 'energetic'
					: /gentle|quiet/u.test(text) ? 'gentle' : 'calm'
			},
			emotion: {
				default: /happy|joy/u.test(text)
					? 'happy'
					: /angry/u.test(text) ? 'angry' : /sad/u.test(text) ? 'sad' : 'curious'
			}
		};
	}

	static hairStyle(text) {
		if (/braid/u.test(text)) {
			return 'braids';
		}
		if (/locs/u.test(text)) {
			return 'locs';
		}
		if (/ponytail/u.test(text)) {
			return 'ponytail';
		}
		return 'wave';
	}

	static name(prompt) {
		const match = prompt.match(
			/(?:named|called)\s+([A-Z][A-Za-z'-]+)/u
		);
		return match?.[1] || 'AI Proposed Original';
	}
}
