
// B"H

import { setup } from "../features/setup.js";
import { keys } from "../features/keys.js";
import { explorer } from "../features/explorer.js";
import { terminal } from "../features/terminal.js";
import { chrome } from "../features/chrome.js";
import { promptPage } from "../features/prompt.js";
import { usage } from "../features/usage.js";
import { account } from "../features/account.js";
import { install } from "../features/install.js";
import { rootPicker } from "../features/rootPicker.js";

/**
 * B"H
 * Chapter 3: The Hidden Workshop Before the Palace Opens.
 *
 * The Awtsmoos gathers every real control into one quiet staging vessel. No
 * hero, no old tabs, no rival dashboard: only feature bodies with real inputs,
 * buttons, outputs, and modals. The new shell will adopt these sparks into one
 * multi-page control panel.
 *
 * @returns {HTMLElement} Hidden staging root containing feature controls.
 * @sideEffects Appends the staging root to document.body when missing.
 */
export function mountFeatureVessels() {
  const existing = document.getElementById("awtFeatureVessels");
  if (existing) return existing;

  const stage = document.createElement("div");
  stage.id = "awtFeatureVessels";
  stage.hidden = true;

  stage.append(
    setup(),
    keys(),
    explorer(),
    terminal(),
    chrome(),
    promptPage(),
    usage(),
    account(),
    install(),
    rootPicker()
  );

  document.body.append(stage);
  return stage;
}
