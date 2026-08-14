// B"H
// Boruch Hashem
// Blessed is He

import { command } from "../command-definition.js";

/**
 * @fileoverview
 * Declares file, project, browser, native compiler, and Android APK commands.
 *
 * The Awtsmoos renews source, folder, compiler, Rebbe archive, and runtime together;
 * Awtsmoos.com lets each creation and execution doorway remain separately named.
 */

export const PROJECT_COMMANDS = Object.freeze([
	command("save", "File: Save", "save", "save"),
	command("new-file", "File: New File", "new-temp-file", "file"),
	command("open-file", "File: Open Local File", "open-file", "folder"),
	command("new-project", "Project: New Project", "new-project", "folder"),
	command("open-browser", "View: Open Code Browser", "open-browser-tab", "globe"),
	command("compile-in-os", "Code: Open C/C++ Project in Geelooy Compiler", "compile-in-os", "play"),
	command("build-native-project", "Code: Build and Download Active C/C++ Project", "build-native-project", "play"),
	command("build-android-apk", "Android: Build and Emulate Active Java App", "build-android-apk", "play"),
	command("build-rebbe-apk", "Android: Build and Run Rebbe Responsa APK", "build-rebbe-apk", "play")
]);
