/**
 * B"H
 * @file EntityRegistry.js
 *
 * Chapter 24: The Registry Became A City Of Names.
 *
 * The Awtsmoos gathers sparks into order. Each runtime entity enters by uu,
 * receives indexes, and leaves cleanly. Nothing here asks where the entity is
 * painted; it asks what covenant it carries.
 */

import { createEntityRuntimeRecord, createEntityRecordFromMesh } from './EntityRuntimeRecord.js';
import { assertUniqueEntity } from './EntityValidation.js';
import { addIndexValue, removeIndexValue, readIndexed } from './EntityLookup.js';

export class EntityRegistry {
  constructor() {
    this.records = new Map();
    this.byId = new Map();
    this.byType = new Map();
    this.byCapability = new Map();
  }

  register(input) {
    const record = createEntityRuntimeRecord(input);
    assertUniqueEntity(this.records, record.uu);
    this.records.set(record.uu, record);
    this.#index(record);
    return record;
  }

  registerMesh(mesh) {
    return this.register(createEntityRecordFromMesh(mesh));
  }

  unregister(uu) {
    const record = this.records.get(uu);
    if (!record) return false;
    this.#unindex(record);
    return this.records.delete(uu);
  }

  get(uu) {
    return this.records.get(uu) || null;
  }

  findById(id) {
    return readIndexed(this.records, this.byId, id);
  }

  findByType(type) {
    return readIndexed(this.records, this.byType, type);
  }

  findByCapability(capability) {
    return readIndexed(this.records, this.byCapability, capability);
  }

  snapshot() {
    return [...this.records.values()].map(({ mesh, ...saveSafe }) => ({ ...saveSafe }));
  }

  #index(record) {
    addIndexValue(this.byId, record.id, record.uu);
    addIndexValue(this.byType, record.type, record.uu);
    Object.entries(record.capabilities || {}).forEach(([key, enabled]) => {
      if (enabled) addIndexValue(this.byCapability, key, record.uu);
    });
  }

  #unindex(record) {
    removeIndexValue(this.byId, record.id, record.uu);
    removeIndexValue(this.byType, record.type, record.uu);
    Object.entries(record.capabilities || {}).forEach(([key, enabled]) => {
      if (enabled) removeIndexValue(this.byCapability, key, record.uu);
    });
  }
}

export default EntityRegistry;
