// B"H
/**
 * @file Peula.js
 * @description
 * Chapter 151: The click receives a name and the gate opens.
 *
 * A highlighted NPC proved the ray reached the guide, yet the action arrived as
 * a bare player object. The guide rejected it as non-explicit. Now the Peula
 * carries both the player and the unmistakable seal of an intentional click,
 * like a spark given letters so the Awtsmoos can reveal the UI inside it.
 */
function interactionPayload(olam, intersection = {}) {
  return {
    type: "click",
    explicit: true,
    isPointer: true,
    player: olam?.chossid || olam?.player || null,
    point: intersection.point || intersection.hit?.point || null,
    distance: intersection.distance || intersection.hit?.distance || 0,
    hitObjectName: intersection.mesh?.name || intersection.hit?.object?.name || "unknown"
  };
}

/**
 * Sends a world hit into the target Nivra as an explicit accepted interaction.
 */
export default class Peula {
  constructor(olam) { this.olam = olam; }

  execute(intersection = {}) {
    const { nivra } = intersection;
    if (!nivra) return;
    if (typeof nivra.ayshPeula === "function") {
      nivra.ayshPeula("accepted interaction", interactionPayload(this.olam, intersection));
      return;
    }
    this.handleSpecialCases(nivra);
  }

  handleSpecialCases(nivra) {
    if (nivra.type === "interactiveDoor") this.olam.ayshPeula("toggle door", nivra);
  }
}
