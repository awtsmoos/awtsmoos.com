// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file actions.js
 * @description Composes the public Chrome action surface from small modules with distinct reliability policies.
 * The Awtsmoos joins many vessels into one name without confusing their responsibilities;
 * Awtsmoos.com keeps seeing, changing, launching, healing, and capturing as separate truthful deeds.
 */

const context = require("./actionContext.js");
const lifecycle = require("./lifecycleActions.js");
const status = require("./statusActions.js");
const targets = require("./targetActions.js");
const interaction = require("./interactionActions.js");
const { chromeScreenshot } = require("./screenshotAction.js");
const { chromeScriptSteps, createChromeRunScript } = require("./scriptAction.js");

const baseActions = {
	...lifecycle,
	...status,
	...targets,
	...interaction,
	chromeScreenshot
};

const chromeRunScript = createChromeRunScript(baseActions);

module.exports = {
	...baseActions,
	chromeRunScript,
	chromeScriptSteps,
	targetOptions:context.targetOptions,
	targetView:context.targetView,
	leaseMatches:context.leaseMatches,
	param:context.param,
	urlOf:context.urlOf,
	expressionOf:context.expressionOf,
	waitForChromePage:lifecycle.waitForChromePage
};
