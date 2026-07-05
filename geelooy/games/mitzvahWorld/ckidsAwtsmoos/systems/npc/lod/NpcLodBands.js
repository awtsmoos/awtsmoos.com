// B"H
/**
 * B"H
 *
 * The NPC LOD bands are the quiet borders of the village.
 * A chossid who is close deserves the full remembered body; a chossid across
 * the field should still be readable without asking the renderer to carry a
 * heavy vessel before its moment.
 *
 * These numbers are intentionally plain. The Awtsmoos renews the whole world
 * every instant, but the browser should only renew expensive GLB detail when
 * the player is near enough to receive it.
 */
export const NPC_NEAR_IN = 18;
export const NPC_NEAR_OUT = 23;
export const NPC_MID_IN = 45;
export const NPC_MID_OUT = 55;

export function desiredNpcLodTier(current = "far", distance = Infinity) {
  if (current === "near") return distance > NPC_NEAR_OUT ? "mid" : "near";
  if (current === "mid") {
    if (distance < NPC_NEAR_IN) return "near";
    if (distance > NPC_MID_OUT) return "far";
    return "mid";
  }
  if (distance < NPC_NEAR_IN) return "near";
  if (distance < NPC_MID_IN) return "mid";
  return "far";
}

export default desiredNpcLodTier;
