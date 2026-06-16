// B"H
import { setup } from "../features/setup.js";
import { keys } from "../features/keys.js";
import { explorer } from "../features/explorer.js";
import { terminal } from "../features/terminal.js";
import { chrome } from "../features/chrome.js";
import { promptPage } from "../features/prompt.js";
import { usage } from "../features/usage.js";
import { compute } from "../features/compute.js";
import { previewGateway } from "../features/previewGateway.js";
import { aiAgents } from "../features/aiAgents.js";
import { live } from "../features/live.js";
import { account } from "../features/account.js";
import { install } from "../features/install.js";
import { rootPicker } from "../features/rootPicker.js";

/**
 * B"H
 * Chapter 420: The hidden vessels gained the Preview Gateway.
 */
export function mountFeatureVessels() {
  const existing = document.getElementById("awtFeatureVessels");
  if (existing) return existing;
  const stage = document.createElement("div");
  stage.id = "awtFeatureVessels";
  stage.hidden = true;
  stage.append(setup(), keys(), explorer(), terminal(), chrome(), promptPage(), usage(), compute(), previewGateway(), aiAgents(), live(), account(), install(), rootPicker());
  document.body.append(stage);
  return stage;
}
