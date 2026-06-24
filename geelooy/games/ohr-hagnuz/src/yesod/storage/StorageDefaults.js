/**
 * B"H
 * @module StorageDefaults
 * @description Plain bank/vault shapes for Ohr HaGnuz long-term collection.
 */
export const storageDefaults = () => ({
  money: 0,
  items: {},
  garments: [],
  history: []
});

export const storageEvent = (type, id, amount) => ({
  type,
  id,
  amount,
  at: new Date().toISOString()
});
