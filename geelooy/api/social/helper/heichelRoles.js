//B"H
//Blessed is He
//Boruch Hashem


/**
 * Heichel roles API: thin barrel over the heichelRoles* siblings.
 * Importers need no changes; the export surface is identical.
 */

var { ROLE_NAMES, SETTING_DEFAULTS } = require("./heichelRolesCore.js");
var { getHeichelRoleList, addHeichelRoleMember, removeHeichelRoleMember } = require("./heichelRolesMembers.js");
var { getHeichelSubmissionSettings, updateHeichelSubmissionSettings } = require("./heichelRolesSettings.js");

module.exports = {
	ROLE_NAMES,
	SETTING_DEFAULTS,
	getHeichelRoleList,
	addHeichelRoleMember,
	removeHeichelRoleMember,
	getHeichelSubmissionSettings,
	updateHeichelSubmissionSettings
};
