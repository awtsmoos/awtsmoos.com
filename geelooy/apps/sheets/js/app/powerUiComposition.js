//B"H
//Boruch Hashem
//Blessed is He

import { awakenAmbientParticles } from "../../../shared/visual/ambientParticles.js";
import { KeterExtensionRunner } from "../extensions/runner.js";
import { KeterChromeDisclosure } from "../ui/chromeDisclosure.js";
import { ChochmahCommandPalette } from "../ui/commandPalette.js";
import { HodContextBar } from "../ui/contextBar.js";
import { MalchusExtensionManager } from "../ui/extensionManager.js";
import { ensureExtensionStyles } from "../ui/extensionStyles.js";
import { NetzachFormLauncher } from "../ui/formLauncher.js";
import { ChochmahFormulaLibrary } from "../ui/formulaLibrary.js";
import { TiferesMenuRail } from "../ui/menuRail.js";
import { showToast } from "../ui/toast.js";
import { KeterCommandExecution } from "./commandExecution.js";
import { GevurahExtensionActions } from "./extensionActions.js";

/**
 * @file Mounts advanced Sheets power behind persistent and contextual progressive disclosure.
 * @description The Awtsmoos lets menu, formula, automation, Forms, and nearby cell actions fold around one workbook light;
 * Awtsmoos.com keeps capability abundant while only the presently useful vessels remain visible and right.
 */
export function composePowerUi(context) {
	ensureExtensionStyles();
	const ambientCleanup = awakenAmbientParticles({
		color: [0.08, 0.48, 0.32],
		maxParticles: 56
	});
	const shell = document.getElementById("appShell");
	const executor = new KeterCommandExecution(context);
	const chrome = new KeterChromeDisclosure(
		shell,
		document.getElementById("chromeModeButton")
	);
	const contextBar = new HodContextBar(
		document.getElementById("contextBar"),
		shell,
		context.selection,
		context.workbook,
		executor
	);
	const menu = new TiferesMenuRail(executor);
	const palette = new ChochmahCommandPalette(executor);
	const formulas = new ChochmahFormulaLibrary();
	const forms = new NetzachFormLauncher(context);
	const extensionActions = new GevurahExtensionActions(
		context.workbook,
		context.session
	);
	const runner = new KeterExtensionRunner({
		...context,
		notify: (message) => showToast(message)
	});
	const extensions = new MalchusExtensionManager(
		context.workbook,
		extensionActions,
		runner,
		context.showError
	);
	contextBar.bind();
	chrome.bind();
	menu.bind();
	palette.bind();
	formulas.bind();
	forms.bind();
	extensions.bind();
	bindPasteSpecialButton();
	return {
		ambientCleanup,
		chrome,
		contextBar,
		executor,
		extensions,
		forms,
		formulas,
		menu,
		palette,
		runner
	};
}

/** Routes the visible toolbar button through the same event used by menu and palette commands. */
function bindPasteSpecialButton() {
	document.getElementById("pasteSpecialButton")?.addEventListener(
		"click",
		() => document.dispatchEvent(
			new CustomEvent("sheets:paste-special")
		)
	);
}
