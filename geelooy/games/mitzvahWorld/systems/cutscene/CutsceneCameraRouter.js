// B"H
import { cameraMovePacket, cameraFocusPacket } from "./packets/CameraPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function routeCameraBeat(beat = {}) { if (beat.payload?.kind === "camera_rail") return cameraMovePacket(beat.payload.id || beat.id, beat.at || 0, beat.payload.shot?.duration || beat.payload.duration || 1, beat.payload); return beat.payload?.shot?.target || beat.payload?.target || beat.target ? cameraFocusPacket(beat.id, beat.at || 0, beat.payload?.duration || beat.duration || 1, beat.payload?.target || beat.target) : cameraMovePacket(beat.id, beat.at || 0, beat.duration || 1, beat.payload || beat); }
export default routeCameraBeat;
