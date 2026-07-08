// B"H
import { cameraFocusPacket } from "../../cutscene/packets/CameraPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { dialoguePacket } from "../../cutscene/packets/DialoguePacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { cinematicPacketReport } from "../../cutscene/packets/CinematicPacketReport.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
const packets = [cameraFocusPacket("focus",0,1,"woodsman"), dialoguePacket("line",1,2,{speaker:"woodsman",text:"Hi"})];
console.log(JSON.stringify(cinematicPacketReport(packets), null, 2));
