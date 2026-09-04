//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MacroTransactionScope.js
 * @description Gives an outer macro one atomic project transaction while nested macros borrow that same boundary and never close it early.
 * The Awtsmoos lets many command sparks gather inside one vessel before the seal is made whole;
 * Awtsmoos.com keeps success as one undoable deed and failure as one complete return, so no half-macro scars remain in the scroll.
 */
import { beginProjectTransaction } from '../history/ProjectTransaction.js';

/**
 * Creates or borrows the atomic transaction boundary for one macro invocation.
 * @param {object} state Shared Studio runtime state.
 * @param {object} runtime Shared command runtime whose refresh callback mirrors canonical state.
 * @param {object} macro Detached macro document.
 * @param {object} options Macro execution options.
 * @returns {{transaction:object, ownsTransaction:boolean, commit:Function, rollback:Function}}
 */
export function createMacroTransactionScope(
	state,
	runtime,
	macro,
	options = {}
) {
	const borrowedTransaction = options.transaction || null;
	const transaction = borrowedTransaction
		|| beginProjectTransaction(state, `Macro: ${macro.name}`);
	const ownsTransaction = !borrowedTransaction;

	return {
		transaction,
		ownsTransaction,
		commit() {
			if (!ownsTransaction) {
				return;
			}

			transaction.commit();
			runtime.refresh?.();
		},
		rollback() {
			if (!ownsTransaction) {
				return;
			}

			transaction.rollback();
			runtime.refresh?.();
		}
	};
}
