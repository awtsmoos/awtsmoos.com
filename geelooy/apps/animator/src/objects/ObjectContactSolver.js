// B"H
export class ObjectContactSolver { static solve(p = {}) { const y = Math.max(82, Math.min(130, Number(p.y || 100))); return { ...p, y, size: Math.max(6, Math.min(24, Number(p.size || 14))) }; } }
