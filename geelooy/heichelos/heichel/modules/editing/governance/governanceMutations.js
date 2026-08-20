//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GovernanceMutations
 * @description
 * The Awtsmoos lets Chesed invite and Gevurah remove while one Yesod vessel protects the API bond;
 * Awtsmoos.com keeps mutation, transport failure, and success reporting explicit and beyond.
 */
import { ROLE_CONFIG } from './governanceConfig.js';
import { announceGovernance } from './governanceElements.js';

/** Owns governance mutations while leaving rendering and loading to collaborators. */
export class GovernanceMutations {
	/**
	 * @param {object} options - Mutation dependencies and stable identity context.
	 * @param {string} options.heichelId - Managed Heichel identifier.
	 * @param {string} options.aliasId - Acting administrator alias.
	 * @param {HTMLElement} options.status - Shared semantic live status rail.
	 * @param {object} options.api - Existing Heichel role API module.
	 * @param {(roleTitle: string) => Promise<string|null>} options.promptAlias - Authored alias prompt.
	 * @param {() => Promise<void>} options.refreshRoles - Role refresh callback after membership changes.
	 */
	constructor(options) {
		Object.assign(this, options);
	}

	/** Prompts for an alias and adds it to one stable role. */
	async addMember(role) {
		const roleTitle = ROLE_CONFIG[role]?.title || role;
		const memberAliasId = await this.promptAlias(roleTitle);
		if (!memberAliasId) {
			return;
		}
		await this.perform({
			busyMessage: `Adding @${memberAliasId} to ${roleTitle}…`,
			successMessage: `Added @${memberAliasId}.`,
			action: () => this.api.addRoleMember({
				heichelId: this.heichelId,
				aliasId: this.aliasId,
				role,
				memberAliasId
			}),
			afterSuccess: this.refreshRoles
		});
	}

	/** Removes one alias from a role and refreshes membership truth on success. */
	async removeMember(role, memberAliasId) {
		await this.perform({
			busyMessage: `Removing @${memberAliasId}…`,
			successMessage: `Removed @${memberAliasId}.`,
			action: () => this.api.removeRoleMember({
				heichelId: this.heichelId,
				aliasId: this.aliasId,
				role,
				memberAliasId
			}),
			afterSuccess: this.refreshRoles
		});
	}

	/** Persists the already-serialized submission-policy payload. */
	async saveSettings(settings) {
		await this.perform({
			busyMessage: 'Saving submission policy…',
			successMessage: 'Submission policy saved.',
			action: () => this.api.saveSubmissionSettings({
				heichelId: this.heichelId,
				aliasId: this.aliasId,
				settings
			})
		});
	}

	async perform({ busyMessage, successMessage, action, afterSuccess }) {
		announceGovernance(this.status, 'busy', busyMessage);
		try {
			const result = await action();
			if (!result?.success) {
				announceGovernance(this.status, 'error', readApiError(result, 'Governance change failed.'));
				return false;
			}
			announceGovernance(this.status, 'success', successMessage);
			if (afterSuccess) {
				await afterSuccess();
			}
			return true;
		} catch (error) {
			announceGovernance(this.status, 'error', error?.message || 'Governance request failed.');
			return false;
		}
	}
}

/** Extracts an existing API error without exposing raw transport internals. */
export function readApiError(result, fallback) {
	return result?.error?.message || result?.error?.code || fallback;
}
