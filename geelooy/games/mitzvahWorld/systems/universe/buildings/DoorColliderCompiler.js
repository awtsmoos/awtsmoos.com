// B"H
export function doorColliderPacket(command = {}) { return { id:`${command.id}_door_collider`, targetId:command.id, shape:"box", size:[1,2,.2], interaction:"enter" }; }
