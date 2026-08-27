//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VehicleContract.js
 * @description Names the stable JSON covenant and open vocabulary shared by every generated wheeled vehicle.
 * The Awtsmoos turns wheel and axle without being circled by either; Awtsmoos.com gives car, chariot, bicycle, wagon, rover, and future transport one semantic river.
 */

export const VEHICLE_SCHEMA = 'awtsmoos.vehicle';
export const VEHICLE_VERSION = 1;

export const VEHICLE_FAMILIES = Object.freeze([
	'car', 'pickup', 'van', 'bus', 'truck', 'tractor', 'trailer',
	'bicycle', 'motorcycle', 'scooter', 'tricycle', 'chariot', 'cart',
	'wagon', 'carriage', 'handcart', 'wheelbarrow', 'rover', 'custom'
]);

export const VEHICLE_PROPULSION_TYPES = Object.freeze([
	'unpowered', 'animal', 'human', 'electric', 'combustion',
	'hybrid', 'external-tow', 'wind', 'custom'
]);

export const VEHICLE_STEERING_TYPES = Object.freeze([
	'none', 'fixed', 'fork', 'ackermann-intent', 'rear-intent',
	'all-wheel-intent', 'articulated-intent', 'differential-intent', 'custom'
]);

export const VEHICLE_SUSPENSION_TYPES = Object.freeze([
	'rigid', 'spring-damper', 'leaf-intent', 'trailing-arm-intent',
	'swingarm', 'fork', 'bogie-intent', 'custom'
]);

export const VEHICLE_WHEEL_TYPES = Object.freeze([
	'pneumatic', 'solid', 'wood-spoke', 'metal-rim', 'bicycle',
	'motorcycle', 'racing', 'caster', 'fantasy', 'custom'
]);

export const VEHICLE_MATERIAL_ROLES = Object.freeze([
	'rubber', 'rim-metal', 'frame-metal', 'body-paint', 'wood',
	'iron', 'glass', 'leather', 'fabric', 'lamp', 'brake-metal'
]);
