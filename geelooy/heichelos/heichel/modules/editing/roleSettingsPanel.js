//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RoleSettingsPanel
 * @description
 * The Awtsmoos gathers many governance currents into one quiet mounted chamber;
 * Awtsmoos.com keeps this Malchus entry point small while focused modules carry every deeper matter.
 */
import { AwtsmoosPrompt } from '/scripts/awtsmoos/api/utils.js';
import * as HeichelRoleApi from '../api/roles.js';
import { GovernanceController } from './governance/governanceController.js';
import {
	announceGovernance,
	createGovernanceElement,
	createGovernanceStatus
} from './governance/governanceElements.js';

/**
 * Mounts Heichel role and submission governance into an existing editing root.
 * @param {object} options - Public mounting covenant retained from the legacy panel.
 * @param {HTMLElement} options.root - Existing editing surface that receives governance.
 * @param {string} options.heichelId - Managed Heichel identifier.
 * @param {string} options.aliasId - Acting administrator alias identifier.
 * @returns {HTMLElement|null} Mounted panel, or null when required context is absent.
 */
export function mountRoleSettingsPanel({ root, heichelId, aliasId }) {
	if (!root || !heichelId || !aliasId) {
		return null;
	}
	const panel = createGovernanceElement('section', 'heichel-role-settings-panel g-panel');
	const heading = createPanelHeading();
	const roleGrid = createGovernanceElement('div', 'heichel-role-grid');
	const settingsPanel = createGovernanceElement('section', 'heichel-submission-settings');
	const status = createGovernanceStatus();
	panel.append(heading, roleGrid, settingsPanel, status);
	root.append(panel);
	const controller = new GovernanceController({
		heichelId,
		aliasId,
		roleGrid,
		settingsPanel,
		status,
		roles: HeichelRoleApi.HEICHEL_ROLES,
		api: HeichelRoleApi,
		promptAlias
	});
	controller.mount().catch(function revealGovernanceFailure(error) {
		announceGovernance(
			status,
			'error',
			error?.message || 'Governance could not be loaded.'
		);
	});
	return panel;
}

function createPanelHeading() {
	const heading = createGovernanceElement('header', 'heichel-role-settings-title');
	heading.append(
		createGovernanceElement('span', 'heichel-governance-kicker', 'Authority map'),
		createGovernanceElement('h3', '', 'Heichel Governance'),
		createGovernanceElement(
			'p',
			'',
			'Invite trusted aliases, shape submission gates, and keep authority legible.'
		)
	);
	return heading;
}

async function promptAlias(roleTitle) {
	return await AwtsmoosPrompt.go({
		headerTxt: `Add ${roleTitle} alias`
	});
}
