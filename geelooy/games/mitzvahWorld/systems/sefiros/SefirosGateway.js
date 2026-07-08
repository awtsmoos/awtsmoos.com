// B"H
import { sefirahPacket } from "./SefirahPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { sefirahForCommand } from "./SefirosCommandMap.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function commandToSefirahPacket(command = {}) { return sefirahPacket(sefirahForCommand(command), "universe_command", command); }
export function commandsToSefiros(commands = []) { return commands.map(commandToSefirahPacket); }
