// B"H
import { cameraFocusPacket } from "../../cutscene/packets/CameraPacket.js";
import { dialoguePacket } from "../../cutscene/packets/DialoguePacket.js";
import { cinematicPacketReport } from "../../cutscene/packets/CinematicPacketReport.js";
const packets = [cameraFocusPacket("focus",0,1,"woodsman"), dialoguePacket("line",1,2,{speaker:"woodsman",text:"Hi"})];
console.log(JSON.stringify(cinematicPacketReport(packets), null, 2));
