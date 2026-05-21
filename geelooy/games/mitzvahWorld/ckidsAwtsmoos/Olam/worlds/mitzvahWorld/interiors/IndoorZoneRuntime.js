/**
 * B"H
 * Chapter 25: The Air Changed Its Name Indoors.
 */

export class IndoorZoneRuntime {
  constructor(zones = {}) {
    this.zones = zones;
    this.currentZoneId = null;
  }

  enter(zoneId) {
    const zone = this.zones[zoneId];
    if (!zone) throw new Error(`Unknown indoor zone: ${zoneId}`);
    this.currentZoneId = zoneId;
    return { zoneId, audio: zone.audio || 'indoor', lighting: zone.lighting || 'warm' };
  }

  leave() {
    const zoneId = this.currentZoneId;
    this.currentZoneId = null;
    return { zoneId, audio: 'outdoor', lighting: 'world' };
  }

  snapshot() {
    return { currentZoneId: this.currentZoneId };
  }
}

export default IndoorZoneRuntime;
