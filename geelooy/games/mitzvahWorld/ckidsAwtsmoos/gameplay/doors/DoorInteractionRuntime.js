// B"H
export function openDoor(doors, doorId) {
  const door = doors.find(row => row.id === doorId) || doors[0];
  if (!door) return { ok:false, reason:"no-door" };
  door.open = true;
  door.interior = true;
  door.openedAt = Date.now();
  return { ok:true, doorId:door.id, open:true, interior:true, collision:"doorway-passable" };
}

export function doorState(doors) {
  return doors.map(door => ({ id:door.id, open:door.open, interior:door.interior, clickable:true, x:door.x, y:door.y }));
}
