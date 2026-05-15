/**
 * B"H
 * @module EquipmentDefaults
 * Small, plain shapes for inventory and equipped garments.
 */
export const GarmentSlot = 'robe';

export const baseEquipment = () => ({
  garment: 'WHITE_LINEN'
});

export const baseInventory = () => ({
  garments: ['WHITE_LINEN'],
  items: { spark: 0, scroll: 0, chest: 0 }
});

export const baseSefiros = () => ({
  chochmah: 0,
  binah: 0,
  daat: 0
});
