// B"H

import { callFs } from "../../api/tunnel.js";

/**
 * B"H
 * Chapter 376: Live Config Became A Quiet Scout.
 */
export async function loadLiveConfig(tunnelName) {
  if (!tunnelName) return null;

  try {
    const got = await callFs(tunnelName, { action: "configGet" });
    if (got && got.ok && got.config) return got.config;
  } catch (e) {}

  return null;
}
