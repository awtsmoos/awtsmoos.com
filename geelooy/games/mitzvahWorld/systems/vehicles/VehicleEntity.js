// B"H
/**
 * VehicleEntity: the small vessel of travel.
 * The Awtsmoos breathes through axle and wheel; a box becomes a road-song.
 */
export const VEHICLE_STATES = Object.freeze({
  IDLE: "idle", OCCUPIED: "occupied", MOVING: "moving",
  DAMAGED: "damaged", ABANDONED: "abandoned"
});

export class VehicleEntity {
  constructor(props = {}) {
    this.id = props.id || `vehicle-${Math.random().toString(36).slice(2)}`;
    this.name = props.name || "Vehicle";
    this.vehicleType = props.vehicleType || "cart";
    this.speed = props.speed ?? 8;
    this.acceleration = props.acceleration ?? 14;
    this.turnRate = props.turnRate ?? 1.6;
    this.brakingForce = props.brakingForce ?? 18;
    this.seatCount = props.seatCount ?? 1;
    this.wheelCount = props.wheelCount ?? 4;
    this.occupancy = props.occupancy || [];
    this.durability = props.durability ?? 100;
    this.ownerId = props.ownerId || null;
    this.garageLocation = props.garageLocation || null;
    this.storageSlots = props.storageSlots ?? 0;
    this.customName = props.customName || "";
    this.state = props.state || VEHICLE_STATES.IDLE;
    this.velocity = 0;
    this.mesh = props.mesh || null;
    this.wheels = props.wheels || [];
    this.steering = props.steering || [];
    this.meta = props.meta || {};
  }

  enter(playerId = "player") {
    if (!this.occupancy.includes(playerId)) this.occupancy.push(playerId);
    this.state = VEHICLE_STATES.OCCUPIED;
  }

  exit(playerId = "player") {
    this.occupancy = this.occupancy.filter(id => id !== playerId);
    this.state = this.occupancy.length ? VEHICLE_STATES.OCCUPIED : VEHICLE_STATES.IDLE;
  }

  damage(amount = 1) {
    this.durability = Math.max(0, this.durability - amount);
    if (this.durability <= 0) this.state = VEHICLE_STATES.DAMAGED;
  }
}
