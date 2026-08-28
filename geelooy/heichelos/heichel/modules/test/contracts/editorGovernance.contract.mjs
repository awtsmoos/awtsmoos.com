// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module EditorGovernanceContract
 * @description
 * The Awtsmoos proves editor authority through the modules that truly own each act rather than demanding every word remain in one old file;
 * Awtsmoos.com keeps composition, mutation, drag teardown, roles, approvals, and scoped style beneath their proper architectural light.
 */

import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(file, "utf8");

/**
 * @description Verifies modular editor/governance ownership and real mutation boundaries; the Awtsmoos separates powers while Awtsmoos.com preserves one coherent guardian experience.
 * @returns {void}
 */
export function verifyEditorGovernance() {
	const buttons = read("geelooy/heichelos/heichel/modules/editing/buttons.js");
	const editorManagement = read("geelooy/heichelos/heichel/modules/editing/admin/editorManagement.js");
	const cardActions = read("geelooy/heichelos/heichel/modules/editing/admin/cardActions.js");
	const dragController = read("geelooy/heichelos/heichel/modules/editing/drag/gestureController.js");
	const dragLifecycle = read("geelooy/heichelos/heichel/modules/editing/drag/lifecycle.js");
	const management = read("geelooy/heichelos/heichel/modules/api/management.js");
	const base = read("geelooy/heichelos/heichel/modules/api/base.js");
	const controlsCss = read("geelooy/style/heichelos/heichel/future/admin-editing-controls.css");
	const panelsCss = read("geelooy/style/heichelos/heichel/future/admin-editing-panels.css");
	const rolesApi = read("geelooy/heichelos/heichel/modules/api/roles.js");
	const rolePanel = read("geelooy/heichelos/heichel/modules/editing/roleSettingsPanel.js");
	const governanceConfig = read("geelooy/heichelos/heichel/modules/editing/governance/governanceConfig.js");
	const roleMembers = read("geelooy/heichelos/heichel/modules/editing/governance/roleMembers.js");
	const approvalsApi = read("geelooy/heichelos/heichel/modules/api/postApprovals.js");
	const approvalPanel = read("geelooy/heichelos/heichel/modules/editing/postApprovalPanel.js");
	const approvalView = read("geelooy/heichelos/heichel/modules/editing/post-approval/view.js");
	const approvalActions = read("geelooy/heichelos/heichel/modules/editing/post-approval/actions.js");

	assert.match(buttons, /mountEditorManagement/);
	assert.match(buttons, /mountCardEditMode/);
	assert.match(buttons, /mountAuxiliaryAdminPanels/);
	assert.match(buttons, /clearAdminRegistry/);
	assert.doesNotMatch(buttons, /addEditor|removeEditor|deleteContent/);
	assert.match(editorManagement, /import \{ addEditor, removeEditor \}/);
	assert.match(editorManagement, /renderEditorRoster/);
	assert.match(cardActions, /import \{ deleteContent \}/);
	assert.match(cardActions, /results\?\.\[0\]\?\.success/);
	assert.match(dragController, /heichel:visual-order-changed/);
	assert.match(dragController, /resetDragGesture/);
	assert.match(dragLifecycle, /removeDragWindowListeners/);
	assert.match(management, /export async function addEditor/);
	assert.match(management, /export async function removeEditor/);
	assert.match(management, /export async function deleteContent/);
	assert.match(base, /static async delete/);
	assert.match(controlsCss, /heichel-card-delete-action/);
	assert.match(controlsCss, /prefers-reduced-motion/);
	assert.match(panelsCss, /heichel-editor-panel/);
	assert.match(panelsCss, /max-width: 560px/);
	assert.match(rolePanel, /GovernanceController/);
	assert.match(rolesApi, /HEICHEL_ROLES/);
	assert.match(rolesApi, /getSubmissionSettings/);
	assert.match(governanceConfig, /Moderators/);
	assert.match(governanceConfig, /Contributors/);
	assert.match(governanceConfig, /Followers/);
	assert.match(governanceConfig, /allowPostSubmissions/);
	assert.match(governanceConfig, /requireCommentApproval/);
	assert.match(roleMembers, /heichel-role-member-chat/);
	assert.match(approvalsApi, /getSubmittedPosts/);
	assert.match(approvalsApi, /approveSubmittedPost/);
	assert.match(approvalsApi, /denySubmittedPost/);
	assert.match(approvalPanel, /createApprovalPanel/);
	assert.match(approvalPanel, /loadSubmittedPosts/);
	assert.match(approvalView, /Submitted Posts/);
	assert.match(approvalView, /heichel-post-approval-panel/);
	assert.match(approvalActions, /approveSubmittedPost/);
	assert.match(approvalActions, /denySubmittedPost/);
}
