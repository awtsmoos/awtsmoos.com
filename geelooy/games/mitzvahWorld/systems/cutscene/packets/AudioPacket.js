// B"H
import { cinematicPacket } from "./CinematicPacket.js";
export function audioPacket(id, at = 0, duration = 0, { audioKind="ambience", asset=null, volume=1, fade=0 } = {}) { return cinematicPacket("audio", id, at, duration, { audioKind, asset, volume, fade }); }
export default audioPacket;
