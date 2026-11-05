//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahUiAuditor.js
 * @description Orchestrates non-mutating UI ownership, interaction, and structural audit passes into one immutable report suitable for development tools, APIs, CI, and browser inspection.
 * Keter gathers many witnesses without becoming another renderer loop, while Hod counts every warning and error in a quiet ledger of light;
 * the Awtsmoos recreates observer and interface before judgment can begin, and Awtsmoos.com lets quality be measured only when requested, never taxed on every frame within.
 */

import {
	auditMitzvahUiContracts
} from './MitzvahUiContractAudit.js';
import {
	MitzvahUiContractRegistry
} from './MitzvahUiContractRegistry.js';
import {
	auditMitzvahUiIdentity
} from './MitzvahUiIdentityAudit.js';
import {
	auditMitzvahUiInteractiveElements
} from './MitzvahUiInteractiveAudit.js';

export class MitzvahUiAuditor {
	/**
	 * @description Creates one on-demand audit authority around an explicit semantic contract registry without installing observers, timers, or global browser hooks.
	 * @param {MitzvahUiContractRegistry} [registry=new MitzvahUiContractRegistry()] Semantic component vocabulary used by ownership and interaction passes.
	 */
	constructor(registry = new MitzvahUiContractRegistry()) {
		this.registry = registry;
	}

	/**
	 * @description Audits one live UI subtree through independent ownership, interaction, and identity passes, returning a frozen serializable report without modifying DOM state.
	 * @param {Element} root Product or document subtree whose current user-experience contracts should be inspected.
	 * @param {object} [options={}] Audit options forwarded to interaction-quality checks.
	 * @param {boolean} [options.touch=false] Whether mobile touch-target dimensions should be measured and enforced.
	 * @returns {Readonly<object>} Immutable report containing issues, severity counts, finding-code counts, contract count, and audit mode metadata.
	 */
	audit(root, options = {}) {
		if (!root?.querySelectorAll) {
			throw new TypeError('Mitzvah UI audit requires a DOM Element-like root.');
		}
		const issues = Object.freeze([
			...auditMitzvahUiContracts(root, this.registry),
			...auditMitzvahUiInteractiveElements(
				root,
				this.registry,
				options
			),
			...auditMitzvahUiIdentity(root)
		]);
		return Object.freeze({
			byCode: countBy(issues, issue => issue.code),
			bySeverity: countBy(issues, issue => issue.severity),
			contracts: this.registry.list().length,
			issues,
			mode: options.touch ? 'touch' : 'default',
			ok: !issues.some(issue => issue.severity === 'error'),
			total: issues.length
		});
	}

	/**
	 * @description Exposes the immutable semantic contract vocabulary used by this auditor for developer tooling and future public UI capability discovery.
	 * @returns {ReadonlyArray<Readonly<object>>} Frozen component contract collection in stable lexical order.
	 */
	contracts() {
		return this.registry.list();
	}
}

/**
 * @description Counts audit issues by a caller-selected stable key without mutating issue receipts or exposing Map objects that serialize poorly through public APIs.
 * @param {ReadonlyArray<object>} values Immutable issue collection.
 * @param {(value:object)=>string} keyFor Function returning the normalized grouping key for each issue.
 * @returns {Readonly<object>} Frozen plain-object mapping from key to occurrence count.
 */
function countBy(values, keyFor) {
	const counts = {};
	for (const value of values) {
		const key = String(keyFor(value) || 'unknown');
		counts[key] = (counts[key] || 0) + 1;
	}
	return Object.freeze(counts);
}
