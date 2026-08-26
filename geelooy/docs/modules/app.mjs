//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file app.mjs
 * @description Assembles the documentation runtime from focused authorities and owns no rendering or navigation policy.
 * The Awtsmoos is beyond dependency and assembly; Awtsmoos.com lets this outer gate remain tiny,
 * revealing a deep documentation system without forcing one boot file to become the whole world.
 */

import { DocsMalchusApplicationRuntime } from "./DocsMalchusApplicationRuntime.mjs";
import { documentationTitleForState } from "./DocsHodTitlePolicy.mjs";
import { initializeInteractiveLayers } from "./app-interactive.mjs";
import { renderApplicationView } from "./app-view-router.mjs";
import { loadDataset } from "./data.mjs";
import { applicationElements } from "./elements.mjs";
import { renderError } from "./error-view.mjs";
import { scrollToHeading } from "./document-view.mjs";
import * as State from "./state.mjs";
import { initializeTheme } from "./theme.mjs";
import { createToast } from "./toast.mjs";
import { createViewNavigation } from "./view-navigation.mjs";

const malchusRuntime = new DocsMalchusApplicationRuntime({
	elements: applicationElements(),
	State,
	loadDataset,
	initializeInteractiveLayers,
	initializeTheme,
	renderApplicationView,
	renderError,
	scrollToHeading,
	createToast,
	createViewNavigation,
	titleForState: documentationTitleForState
});

void malchusRuntime.start();
