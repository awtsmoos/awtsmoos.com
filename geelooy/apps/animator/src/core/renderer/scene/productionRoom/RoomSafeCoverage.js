// B"H
export class RoomSafeCoverage { static size(ctx={}){const c=ctx.canvas||ctx.ctx?.canvas||{};return {w:Math.max(1100,Number(c.width||ctx.width||900)*1.6),h:Math.max(900,Number(c.height||ctx.height||700)*1.4)};} }
