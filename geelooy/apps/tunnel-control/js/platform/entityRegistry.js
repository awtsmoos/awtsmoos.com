// B"H

const entities = new Map();

export function registerEntity(entity) {
  entities.set(entity.id, entity);
  return entity;
}

export function getEntity(id) {
  return entities.get(id);
}

export function listEntities(type) {
  const values = [...entities.values()];
  return type ? values.filter(entity => entity.type === type) : values;
}
