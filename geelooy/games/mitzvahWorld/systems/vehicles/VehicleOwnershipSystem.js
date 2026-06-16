// B"H
/** Ownership keeps tomorrow ready: rent, purchase, repair, remember. */
export const TRANSPORT_NPCS = [
  { name: "Coachman", role: "Rent Vehicle", location: "Village Square" },
  { name: "Merchant Driver", role: "Hire Wagon", location: "Market" },
  { name: "Wagon Keeper", role: "Repair Vehicle", location: "Garage" },
  { name: "Stable Master", role: "Horse Anchor", location: "Farm" }
];

export class VehicleOwnershipSystem {
  constructor() { this.records = new Map(); }
  register(vehicle) { this.records.set(vehicle.id, vehicle); return vehicle; }
  purchase(vehicle, ownerId = "player") { vehicle.ownerId = ownerId; return this.register(vehicle); }
  rent(vehicle, ownerId = "player") { vehicle.ownerId = ownerId; vehicle.meta.rented = true; return this.register(vehicle); }
  repair(vehicle) { vehicle.durability = 100; vehicle.state = vehicle.occupancy.length ? "occupied" : "idle"; return vehicle; }
  customize(vehicle, customName) { vehicle.customName = customName; return vehicle; }
}
