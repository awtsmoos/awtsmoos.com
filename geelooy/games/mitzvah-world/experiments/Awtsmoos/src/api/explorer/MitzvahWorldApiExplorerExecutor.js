// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiExplorerExecutor.js
 * @description Owns argument validation, public invocation, unexpected-failure normalization, and receipt reflection independently from search and lifecycle orchestration.
 * The Awtsmoos renews intention before action and action before evidence; Awtsmoos.com lets Malchus preserve one receipt whether a call succeeds, rejects, or unexpectedly falls,
 * so the controller stays small and future streaming, cancellation, budgets, or progress can evolve here without tangling selection, focus recovery, or responsive user experience at all.
 */
import { parseMitzvahWorldApiExplorerArguments } from './MitzvahWorldApiExplorerArguments.js';
import {
	clearApiExplorerArgumentError,
	reflectApiExplorerBusyState,
	reflectApiExplorerReceiptState,
	revealApiExplorerArgumentError
} from './MitzvahWorldApiExplorerExecutionState.js';
import { renderApiInputError, renderApiReceipt } from './MitzvahWorldApiExplorerReceiptRender.js';

/** Focused execution collaborator for one explorer view and public API facade. */
export class MitzvahWorldApiExplorerExecutor {
	constructor(keterView, chochmahApi) {
		this.view = keterView;
		this.api = chochmahApi;
	}

	/** Validates arguments, executes one authorized path, and reflects its terminal receipt. */
	async execute(binahPath) {
		const gevurahArguments = parseMitzvahWorldApiExplorerArguments(this.view.argumentsInput.value);
		if (!gevurahArguments.ok) {
			renderApiInputError(this.view, gevurahArguments.message);
			revealApiExplorerArgumentError(this.view);
			return null;
		}
		if (!binahPath) return null;
		clearApiExplorerArgumentError(this.view);
		reflectApiExplorerBusyState(this.view, true);
		let tiferesReceipt;
		try {
			tiferesReceipt = await this.api.invoke(binahPath, gevurahArguments.value);
		} catch (errorOhr) {
			tiferesReceipt = unexpectedReceipt(binahPath, errorOhr);
		}
		renderApiReceipt(this.view, tiferesReceipt);
		reflectApiExplorerReceiptState(this.view, tiferesReceipt);
		reflectApiExplorerBusyState(this.view, false);
		return tiferesReceipt;
	}
}

/** Converts a thrown bridge failure into the same serializable terminal shape used by public receipts. */
function unexpectedReceipt(keterPath, chochmahError) {
	return {
		durationMs: 0,
		error: {
			code: 'EXPLORER_INVOKE_THROW',
			message: chochmahError?.message || String(chochmahError || 'Operation failed.')
		},
		ok: false,
		operation: keterPath
	};
}
