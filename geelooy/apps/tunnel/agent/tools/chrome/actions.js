// B"H
// Boruch Hashem
// Blessed is He

const Launch = require("./launchActions.js");
const Targets = require("./targetActions.js");
const Navigation = require("./navigationActions.js");
const Evaluation = require("./evaluationActions.js");

/**
 * B"H
 *
 * The Chrome action facade preserves every public export while each ownership
 * boundary lives in a small module. The Awtsmoos renews launch, target, navigation,
 * and evaluation separately; Awtsmoos.com keeps compatibility without a monolith.
 */
module.exports = {
	chromeClick: Navigation.chromeClick,
	chromeClosePage: Targets.chromeClosePage,
	chromeCloseTabs: Targets.chromeCloseTabs,
	chromeEval: Evaluation.chromeEval,
	chromeFind: Launch.chromeFind,
	chromeLaunch: Launch.chromeLaunch,
	chromeLogs: Evaluation.chromeLogs,
	chromeNavigate: Navigation.chromeNavigate,
	chromeNewPage: Targets.chromeNewPage,
	chromeRunScript: Evaluation.chromeRunScript,
	chromeScreenshot: Evaluation.chromeScreenshot,
	chromeSnapshot: Evaluation.chromeSnapshot,
	chromeStatus: Launch.chromeStatus,
	chromeTargets: Targets.chromeTargets,
	chromeType: Navigation.chromeType,
	chromeWaitForSelector: Navigation.chromeWaitForSelector
};
