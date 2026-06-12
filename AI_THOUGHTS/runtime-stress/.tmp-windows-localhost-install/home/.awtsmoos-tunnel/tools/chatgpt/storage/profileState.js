// B"H
const { statePath, profileDir } = require("./paths.js");
const { readJson, writeJson } = require("./jsonStore.js");

/**
 * B"H
 * Stores profile metadata only. The living authenticated session stays inside
 * Chrome's own profile directory.
 */
async function readState() {
  return await readJson(statePath(), { profiles: {}, currentProfile: "default" });
}

async function saveProfileState(name = "default", patch = {}) {
  const state = await readState();
  const profile = { name, userDataDir: profileDir(name), ...(state.profiles[name] || {}), ...patch, updatedAt: new Date().toISOString() };
  state.currentProfile = name;
  state.profiles[name] = profile;
  await writeJson(statePath(), state);
  return profile;
}

async function currentProfile(name = null) {
  const state = await readState();
  const profileName = name || state.currentProfile || "default";
  return state.profiles[profileName] || { name: profileName, userDataDir: profileDir(profileName) };
}

module.exports = { readState, saveProfileState, currentProfile };
