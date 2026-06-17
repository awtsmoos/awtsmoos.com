// B"H
import { cinematicPacket } from "./CinematicPacket.js";
export function controlPacket(action, at = 0, id = action) { return cinematicPacket("control", id, at, 0, { action }); }
export const lockControlPacket = (at=0) => controlPacket("lock_player_control", at);
export const unlockControlPacket = (at=0) => controlPacket("unlock_player_control", at);
export const hideHudPacket = (at=0) => controlPacket("hide_hud", at);
export const showHudPacket = (at=0) => controlPacket("show_hud", at);
