//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GovernanceController
 * @description
 * The Awtsmoos reveals current authority through one Tiferes coordinator of loading and composition;
 * Awtsmoos.com keeps mutation in its own Gevurah vessel so degraded transport never becomes silent confusion.
 */
import { ROLE_CONFIG } from './governanceConfig.js';
import { announceGovernance } from './governanceElements.js';
import { GovernanceMutations } from './governanceMutations.js';
import { createGovernanceNotice } from './governanceNotices.js';
import { createRoleCard } from './roleMembers.js';
import { createSubmissionSettingsView } from './submissionGates.js';

/** Coordinates role/settings loading and delegates every mutation to a focused collaborator. */
export class GovernanceController {
	/**
	 * @param {object} options - Loading, view, identity, and API dependencies.
	 * @param {string} options.heichelId - Managed Heichel identifier.
	 * @param {string} options.aliasId - Acting administrator alias.
	 * @param {HTMLElement} options.roleGrid - Role-card mount region.
	 * @param {HTMLElement} options.settingsPanel - Submission-policy mount region.
	 * @param {HTMLElement} options.status - Shared semantic status rail.
	 * @param {ReadonlyArray<string>} options.roles - Stable API roles.
	 * @param {object} options.api - Existing role/settings API module.
	 * @param {(roleTitle: string) => Promise<string|null>} options.promptAlias - Authored prompt callback.
	 */
	constructor(options) {
		Object.assign(this, options);
		this.mutations = new GovernanceMutations({
			heichelId: this.heichelId,
			aliasId: this.aliasId,
			status: this.status,
			api: this.api,
			promptAlias: this.promptAlias,
			refreshRoles: () => this.refreshRoles()
		});
	}

	/** Loads independent regions and reports a truthful aggregate state. */
	async mount() {
		announceGovernance(this.status, 'busy', 'Loading governance…');
		const results = await Promise.all([
			this.refreshRoles(),
			this.refreshSettings()
		]);
		const degraded = results.includes(false);
		announceGovernance(
			this.status,
			degraded ? 'warning' : 'success',
			degraded ? 'Some governance data could not be loaded.' : 'Governance is current.'
		);
	}

	/** Fetches each role list and manifests one custom card per stable role. */
	async refreshRoles() {
		this.roleGrid.replaceChildren();
		const roleStates = await Promise.all(this.roles.map(role => this.loadRole(role)));
		for (const state of roleStates) {
			this.roleGrid.append(createRoleCard({
				role: state.role,
				members: state.members,
				currentAliasId: this.aliasId,
				onAdd: role => this.mutations.addMember(role),
				onRemove: (role, aliasId) => this.mutations.removeMember(role, aliasId)
			}));
		}
		return !roleStates.some(state => state.failed);
	}

	/** Loads submission truth, or manifests an explicit degraded-state notice. */
	async refreshSettings() {
		this.settingsPanel.replaceChildren();
		try {
			const response = await this.api.getSubmissionSettings({ heichelId: this.heichelId });
			if (response?.error) {
				throw new Error(response.error.message || response.error.code);
			}
			this.settingsPanel.append(createSubmissionSettingsView({
				settings: response?.success || {},
				onSave: settings => this.mutations.saveSettings(settings)
			}));
			return true;
		} catch (error) {
			this.settingsPanel.append(createGovernanceNotice({
				title: 'Submission policy unavailable',
				detail: error?.message || 'The current settings could not be loaded.',
				tone: 'error'
			}));
			return false;
		}
	}

	async loadRole(role) {
		try {
			const response = await this.api.getRoleMembers({ heichelId: this.heichelId, role });
			if (response?.error) {
				throw new Error(response.error.message || response.error.code);
			}
			return { role, members: response?.success || [], failed: false };
		} catch (error) {
			announceGovernance(this.status, 'warning', `Could not load ${ROLE_CONFIG[role]?.title || role}.`);
			return { role, members: [], failed: true, error };
		}
	}
}
