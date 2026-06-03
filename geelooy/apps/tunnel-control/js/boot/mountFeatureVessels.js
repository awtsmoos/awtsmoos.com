// B"H
import { setup } from "../features/setup.js";
import { keys } from "../features/keys.js";
import { explorer } from "../features/explorer.js";
import { terminal } from "../features/terminal.js";
import { chrome } from "../features/chrome.js";
import { promptPage } from "../features/prompt.js";
import { usage } from "../features/usage.js";
import { aiAgents } from "../features/aiAgents.js";
import { live } from "../features/live.js";
import { account } from "../features/account.js";
import { install } from "../features/install.js";
import { rootPicker } from "../features/rootPicker.js";

/**
 * B"H
 * Chapter 371: The Hidden Workshop Added The Living Wire Room.
 *
 * Each pane is first born in the invisible staging vessel. LIVE now enters with
 * keys, agents, terminal, browser, and usage so the shell can reveal realtime
 * histories and socket-pulses whenever the user opens the pane.
 */
export function mountFeatureVessels() {
  const existing = document.getElementById("awtFeatureVessels");
  if (existing) return existing;
  const stage = document.createElement("div");
  stage.id = "awtFeatureVessels";
  stage.hidden = true;
  stage.append(setup(), keys(), explorer(), terminal(), chrome(), promptPage(), usage(), aiAgents(), live(), account(), install(), rootPicker());
  document.body.append(stage);
  return stage;
}
