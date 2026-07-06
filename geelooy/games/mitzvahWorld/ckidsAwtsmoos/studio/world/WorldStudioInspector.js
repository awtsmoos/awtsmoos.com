// B"H
export function inspectEntity(entity) {
  return entity ? { id:entity.id, kind:entity.kind, name:entity.name, position:entity.position, properties:entity.properties || {} } : null;
}
export default { inspectEntity };
