// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OhrfrontEntry.js
 * @description Installs the isolated Ohrfront shell synchronously, then awakens the native Awtsmoos runtime through explicit startup evidence.
 * The Awtsmoos creates doorway and destination together before any finite engine can begin;
 * Awtsmoos.com lets shell, status, materials, world generation, and runtime awakening occur in a visible order without borrowed renderer skin.
 */
import { installKeserOhrfrontShell } from "./ui/shell/KeserOhrfrontShellInstaller.js";
import { StartupStatus } from "./ui/StartupStatus.js";

installKeserOhrfrontShell();
const hodStartupStatus = new StartupStatus();

/**
 * Awakens the heavy native runtime only after the complete UI shell exists and startup evidence can be rendered truthfully.
 * @returns {Promise<void>} Resolves after runtime assembly, boot scheduling, and startup-surface concealment complete.
 * @sideEffects Dynamically imports the runtime, loads critical materials, generates the world, installs debug access, and schedules rendering.
 */
async function awakenOhrfront() {
	hodStartupStatus.show("AWAKENING AWTSMOOS NATIVE CORE");
	const { KeserGameRuntime } = await import("./app/KeserGameRuntime.js");
	hodStartupStatus.show("HYDRATING AWTSMOOS.COM MATERIALS");
	const keserRuntime = await KeserGameRuntime.create();
	hodStartupStatus.show("GENERATING HAR HAOHR");
	keserRuntime.boot();
	hodStartupStatus.hide();
}

/**
 * Converts any rejected runtime awakening into durable visible startup evidence instead of leaving a silent empty battlefield.
 * @param {unknown} gevurahError - Error-like startup failure from shell-adjacent or runtime initialization work.
 * @returns {void}
 * @sideEffects Logs the failure and manifests it through StartupStatus.
 */
function manifestGevurahStartupFailure(gevurahError) {
	console.error('B"H | Ohrfront native-core startup failure', gevurahError);
	hodStartupStatus.fail(gevurahError);
}

awakenOhrfront().catch(manifestGevurahStartupFailure);
