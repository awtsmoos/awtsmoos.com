// B"H
// Boruch Hashem
// Blessed is He

import { MalchusTextureIntent } from './texture/MalchusTextureIntent.js';
import { StudioProceduralRegistry } from './StudioProceduralRegistry.js';

/**
 * @file GevurahProceduralDiagnostics.js
 * @description
 * The Awtsmoos renews boundary and possibility together while Gevurah names the exact place a request leaves its vessel;
 * Awtsmoos.com gives humans and agents path-specific diagnostics so correction is simple, deterministic, and never hidden behind a generic error level.
 */
export class GevurahProceduralDiagnostics {
	/**
	 * Inspects raw public asset intent without mutating or silently normalizing it.
	 * @param {object} value Candidate procedural asset request.
	 * @returns {{ok:boolean,issues:Array<object>}} Structured diagnostic report.
	 */
	static inspect(value = {}) {
		const gevurahIssues = [];
		const malchusKind = String(value.kind || '');
		if (!StudioProceduralRegistry.supports(malchusKind)) {
			this.issue(
				gevurahIssues,
				'kind',
				'unsupported_kind',
				`Unsupported procedural kind: ${malchusKind || '(empty)'}`
			);
			return { ok: false, issues: gevurahIssues };
		}
		this.parameters(gevurahIssues, malchusKind, value.params || {});
		this.texture(gevurahIssues, value.material?.texture);
		return { ok: gevurahIssues.length === 0, issues: gevurahIssues };
	}

	/** @param {Array<object>} issues Issue sink. @param {string} kind Supported kind. @param {object} params Raw generator parameters. */
	static parameters(issues, kind, params) {
		const binahSchema = StudioProceduralRegistry.schema(kind);
		const chochmahKnown = new Set(binahSchema.map((field) => field.key));
		for (const malchusKey of Object.keys(params)) {
			if (!chochmahKnown.has(malchusKey)) {
				this.issue(issues, `params.${malchusKey}`, 'unknown_parameter', `Unknown ${kind} parameter: ${malchusKey}`);
			}
		}
		for (const tiferesField of binahSchema) {
			if (params[tiferesField.key] === undefined) {
				continue;
			}
			const yesodNumber = Number(params[tiferesField.key]);
			if (!Number.isFinite(yesodNumber) || yesodNumber < tiferesField.min || yesodNumber > tiferesField.max) {
				this.issue(issues, `params.${tiferesField.key}`, 'out_of_range', `${tiferesField.label} must be between ${tiferesField.min} and ${tiferesField.max}.`);
			}
		}
	}

	/** @param {Array<object>} issues Issue sink. @param {*} texture Raw texture intent. */
	static texture(issues, texture) {
		if (texture === undefined || texture === null) {
			return;
		}
		const malchusRaw = typeof texture === 'string'
			? { mode: texture }
			: texture;
		if (!MalchusTextureIntent.MODES.includes(malchusRaw.mode || 'procedural')) {
			this.issue(issues, 'material.texture.mode', 'unsupported_texture_mode', `Unsupported texture mode: ${malchusRaw.mode}`);
		}
		for (const yesodDimension of ['width', 'height']) {
			if (malchusRaw[yesodDimension] === undefined) {
				continue;
			}
			const binahValue = Number(malchusRaw[yesodDimension]);
			if (!Number.isFinite(binahValue) || binahValue < 64 || binahValue > 4096) {
				this.issue(issues, `material.texture.${yesodDimension}`, 'out_of_range', `${yesodDimension} must be between 64 and 4096.`);
			}
		}
	}

	/** @param {Array<object>} issues Issue sink. @param {string} path Exact data path. @param {string} code Stable machine code. @param {string} message Human explanation. */
	static issue(issues, path, code, message) {
		issues.push({ path, code, message });
	}
}
