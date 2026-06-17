// B"H
export function houseInteriorPacket(command = {}) { return { id:`${command.id}_interior`, owner:command.id, rooms:command.rooms || ["main"], interactions:["enter","inspect"] }; }
