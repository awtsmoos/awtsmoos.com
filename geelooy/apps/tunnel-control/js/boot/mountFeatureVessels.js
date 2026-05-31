// B"H

import { setup } from "../features/setup.js";
import { keys } from "../features/keys.js";
import { explorer } from "../features/explorer.js";
import { terminal } from "../features/terminal.js";
import { chrome } from "../features/chrome.js";
import { promptPage } from "../features/prompt.js";
import { usage } from "../features/usage.js";
import { aiAgents } from "../features/aiAgents.js";
import { account } from "../features/account.js";
import { install } from "../features/install.js";
import { rootPicker } from "../features/rootPicker.js";

/**
 * B"H
 * Chapter 337: A New Chamber Joined The Hidden Workshop.
 *
 * The staging vessel gathers real controls before the shell adopts them into
 * visible pages. The AI-agent council now enters beside usage, keys, terminal,
 * and browser control, ready to delegate sparks to many model rivers.
 *
 * @returns {HTMLElement} Hidden staging root containing feature controls.
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
    aiAgents(),
    account(),
    install(),
    rootPicker()
  );

  document.body.append(stage);
  return stage;
}
