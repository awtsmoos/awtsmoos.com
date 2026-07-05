// B"H
/** @file HouseOctreeProxyBuilder.js @description Labels house proxy records for octree registration. */
export function sealHouseOctreeProxies(root) {
  Object.assign(root.userData ||= {}, { octreeRegistered:true, houseOctreeProxyBuilder:"tight-story-room-door-proxies" });
  return root;
}

export default { sealHouseOctreeProxies };
