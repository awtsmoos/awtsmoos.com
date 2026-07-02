// B"H
/** Human labels for the loader chapter the player is living through. */
export function label(stage, data = {}) {
  const name = String(stage || "");
  if (data.humanLabel) return String(data.humanLabel);
  if (name.includes("texture")) return "Painting terrain";
  if (name.includes("postbuild")) return "Building playable world";
  if (name.includes("loadedWorld")) return "World data received; waiting for playable frame";
  if (name.includes("canvas")) return "Canvas connected; waiting for gameplay proof";
  if (name.includes("ready")) return "Confirming first playable frame";
  if (name.includes("error")) return "Recovering load";
  return "Preparing Mitzvah World";
}
