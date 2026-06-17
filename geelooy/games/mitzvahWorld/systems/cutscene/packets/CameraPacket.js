// B"H
import { cinematicPacket } from "./CinematicPacket.js";
export function cameraPacket(type, id, at = 0, duration = 0, payload = {}) { return cinematicPacket(`camera_${type}`, id, at, duration, payload); }
export const cameraSetPacket = (id, at, payload) => cameraPacket("set", id, at, 0, payload);
export const cameraMovePacket = (id, at, duration, payload) => cameraPacket("move", id, at, duration, payload);
export const cameraFocusPacket = (id, at, duration, target) => cameraPacket("focus", id, at, duration, { target });
export const cameraShakePacket = (id, at, duration, intensity=.1) => cameraPacket("shake", id, at, duration, { intensity });
export const cameraReturnPacket = (id="camera_return", at=0) => cameraPacket("return", id, at, 0, {});
