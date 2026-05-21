/**
 * B"H
 * Chapter 28: The Mission Waited Behind A Gate Of Deeds.
 */

export class MissionDependencyRuntime {
  constructor(missions = {}) {
    this.missions = missions;
    this.completed = new Set();
  }

  complete(missionId) {
    this.completed.add(missionId);
    return this.available();
  }

  isAvailable(missionId) {
    const mission = this.missions[missionId] || {};
    return (mission.requires || []).every(id => this.completed.has(id));
  }

  available() {
    return Object.keys(this.missions).filter(id => this.isAvailable(id));
  }
}

export default MissionDependencyRuntime;
