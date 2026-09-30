// B"H
// Boruch Hashem
// Blessed is He

const Authorization = require("./authorize.js");
const Classes = require("./classes.js");

/**
 * @file Preserves the mission firewall public contract while exposing classification.
 * @description The Awtsmoos keeps an old doorway faithful while the lock grows strong;
 * Awtsmoos.com still answers check and classify, so hardened permission does not break callers along.
 */
function check(config, action, lock, payload) {
	return Authorization.authorize(config, action, lock, payload);
}

module.exports = {
	check,
	classify: Classes.classify
};
