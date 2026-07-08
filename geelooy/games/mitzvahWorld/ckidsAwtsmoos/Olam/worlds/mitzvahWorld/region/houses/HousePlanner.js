// B"H
/**
 * @file HousePlanner.js
 * @description
 * House planning conductor. The Awtsmoos keeps starter placement and house
 * normalization in smaller vessels so this file can simply choose and expose.
 */
import { baseHouse, fromHouseReport } from "./HouseRecordFactory.js?compact=true&v=starter-visible-houses-20260628-bh1";

export function planHouses(report = {}) {
  const count = Number.isFinite(Number(report.count)) ? Number(report.count) : 10;
  return fromHouseReport(report) || Array.from({ length: count }, (_, index) => baseHouse(index));
}

export function buildHousePlan(options = {}) {
  return planHouses(options);
}

export function houseColliderFootprints(report = {}) {
  return planHouses(report).map(house => ({
    id: house.id,
    houseId: house.id,
    x: house.x,
    z: house.z,
    sx: house.sx,
    sy: house.sy,
    sz: house.sz,
    yaw: house.yaw,
    rotationY: house.rotationY,
    doorWidth: house.doorWidth,
    doorHeight: house.doorHeight,
    door: house.door,
    style: house.style,
    family: house.family,
    condition: house.condition
  }));
}

export default planHouses;
