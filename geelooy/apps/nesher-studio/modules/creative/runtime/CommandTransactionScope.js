//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CommandTransactionScope.js
 * @description Lets one command either own a project transaction or borrow an outer macro transaction without confusing responsibility.
 * The Awtsmoos lets many deeds enter one covenant while each servant knows whether the seal is theirs to close;
 * Awtsmoos.com keeps commit and rollback ownership explicit, so nested creative work cannot fracture the project under hidden prose.
 */
import { beginProjectTransaction } from '../history/ProjectTransaction.js';

/**
 * Creates the transaction responsibility for one command execution.
 * @param {object} state Shared Studio runtime state.
 * @param {object} definition Registered command definition.
 * @param {object} options Execution options that may carry a borrowed transaction.
 * @returns {{transaction:object|null, ownsTransaction:boolean, commit:Function, rollback:Function}}
 */
export function createCommandTransactionScope(
	state,
	definition,
	options = {}
) {
	if (definition.mutation !== 'canonical') {
		return emptyScope();
	}

	const borrowedTransaction = options.transaction || null;
	const transaction = borrowedTransaction
		|| beginProjectTransaction(state, definition.label);
	const ownsTransaction = !borrowedTransaction;

	return {
		transaction,
		ownsTransaction,
		commit() {
			if (ownsTransaction) {
				transaction.commit();
			}
		},
		rollback() {
			if (ownsTransaction) {
				transaction.rollback();
			}
		}
	};
}

/** Returns a no-op scope for commands that do not mutate canonical project truth. */
function emptyScope() {
	return {
		transaction: null,
		ownsTransaction: false,
		commit() {},
		rollback() {}
	};
}
