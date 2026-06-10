//B"H

import { AwtsmoosPrompt } from "../../../prompt.js";

const EXTENSION_ZIP_HREF = "./relay/install/awtsmoos-server-extension.zip";
const EXTENSION_SOURCE_HINT = "geelooy/scripts/tricks/extensions/server";

let missingBridgeNotice = null;

/**
 * Chapter 1: The Download Gate In The Rain Of Sparks.
 *
 * When the ChatGPT bridge is absent, the page must not leave the human staring
 * at a silent wall. The Awtsmoos reveals a handhold inside the wall itself: a
 * real zip button, a local folder hint, and a calm way back to other providers.
 *
 * @param {string} reason Transport failure reason shown in the help body.
 * @returns {void}
 * @sideEffects Opens one alert prompt and reuses the active notice promise so
 * repeated transport failures do not stack modal worlds on top of each other.
 */
export function showMissingBridgeNotice(reason = "") {
  if (missingBridgeNotice) return;
  missingBridgeNotice = Promise.resolve(AwtsmoosPrompt.go({
    isAlert: true,
    title: "B\"H — ChatGPT Transport Needed",
    okText: "Keep using other AIs",
    headerTxt: installHelp(reason),
    extensionHelpTxt: "Use this download when you want ChatGPT conversation history and ChatGPT sending. MiniMax, Gemini, OpenRouter, and Groq can still work independently with their API keys."
  })).finally(() => { missingBridgeNotice = null; });
}

/**
 * B"H — Builds the missing-extension message as one small jeweled vessel.
 *
 * The zip link points at an asset generated from the existing server-extension
 * source folder, so the message offers immediate action instead of merely
 * describing a path.
 *
 * @param {string} reason Optional diagnostic text from the failed transport.
 * @returns {string} HTML rendered inside the Awtsmoos prompt body.
 */
function installHelp(reason = "") {
  return `
    <p><b>ChatGPT transport is not visible yet.</b></p>
    ${reason ? `<p><code>${escapeHtml(reason)}</code></p>` : ""}
    <p>This only blocks ChatGPT conversation loading/sending. You can switch to MiniMax, Gemini, OpenRouter, or Groq and keep using them in the meantime.</p>
    <p><a class="awtsmoos-extension-download" href="${EXTENSION_ZIP_HREF}" download="awtsmoos-server-extension.zip">DOWNLOAD the Awtsmoos Server Extension .zip</a>, unzip it, load the unpacked folder in your browser extensions page, then refresh this tab.</p>
    <p>The source folder is still available at <code>${EXTENSION_SOURCE_HINT}</code>.</p>
  `;
}

/**
 * B"H — Escapes the diagnostic ember before it enters prompt HTML.
 *
 * @param {string} value Raw text from an Error or thrown transport reason.
 * @returns {string} HTML-safe text.
 */
function escapeHtml(value = "") {
  return String(value).replace(/[&<>"]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;"
  }[character]));
}
