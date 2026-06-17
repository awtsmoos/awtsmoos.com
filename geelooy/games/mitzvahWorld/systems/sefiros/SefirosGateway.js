// B"H
import { sefirahPacket } from "./SefirahPacket.js";
import { sefirahForCommand } from "./SefirosCommandMap.js";
export function commandToSefirahPacket(command = {}) { return sefirahPacket(sefirahForCommand(command), "universe_command", command); }
export function commandsToSefiros(commands = []) { return commands.map(commandToSefirahPacket); }
