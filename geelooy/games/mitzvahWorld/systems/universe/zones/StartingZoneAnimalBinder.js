// B"H
export function bindAnimalControllers(objects = [], controllers = []) { const ids = new Set(objects.filter(o => o.type === "animal").map(o => o.id)); return controllers.filter(c => ids.has(c.id)); }
