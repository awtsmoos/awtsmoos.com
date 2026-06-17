// B"H
export function harvestReport(nodes = []) { return { nodes:nodes.length, byKind:nodes.reduce((a,n)=>{ a[n.kind]=(a[n.kind]||0)+1; return a; }, {}), lootEntries:nodes.reduce((n,x)=>n+(x.table?.length||0),0) }; }
