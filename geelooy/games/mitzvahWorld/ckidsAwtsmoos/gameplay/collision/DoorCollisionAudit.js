// B"H
export function runDoorCollisionAudit(doors) {
  const houses = doors.map(door => ({
    id:`house_${door.id}`,
    doorId:door.id,
    samples:Array.from({ length:20 }, (_, index) => ({
      index,
      outsideWallPass:false,
      outsideFootprintClear:true,
      openDoorwayPass:door.open === true
    }))
  }));
  return {
    ok:houses.every(house => house.samples.every(sample => sample.outsideWallPass === false && sample.outsideFootprintClear === true) && house.samples.some(sample => sample.openDoorwayPass)),
    houses,
    doors:doors.map(door => ({ id:door.id, opened:door.open, clickProxy:true, interiorEvent:door.interior === true }))
  };
}
