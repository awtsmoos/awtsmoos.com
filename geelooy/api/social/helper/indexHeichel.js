//B"H
//Blessed is He
//Boruch Hashem


/**
 * Heichel slice of the helper index (heichelRoles is required
 * here exactly as in the original index; its keys stay unexported).
 * Split sibling of index.js (verbatim relocation).
 */

var {
    verifyHeichelAuthority, updateHeichel, getHeichel, getHeichelos,
    deleteHeichel, verifyHeichelViewAuthority, createHeichel,
    getHeichelEditors, removeHeichelEditor, addHeichelEditor,
	generateHeichelId
} = require("./heichel.js");

var {
    ROLE_NAMES,
    SETTING_DEFAULTS,
    getHeichelRoleList,
    addHeichelRoleMember,
    removeHeichelRoleMember,
    getHeichelSubmissionSettings,
    updateHeichelSubmissionSettings
} = require("./heichelRoles.js");

module.exports = {
	verifyHeichelAuthority,
	updateHeichel,
	getHeichel,
	getHeichelos,
	deleteHeichel,
	verifyHeichelViewAuthority,
	createHeichel,
	getHeichelEditors,
	removeHeichelEditor,
	addHeichelEditor,
	generateHeichelId
};
