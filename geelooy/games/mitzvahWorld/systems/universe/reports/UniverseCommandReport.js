// B"H
export function universeCommandReport(commands = []) { return { total:commands.length, byType:commands.reduce((a,c)=>{ a[c.type]=(a[c.type]||0)+1; return a; }, {}) }; }
