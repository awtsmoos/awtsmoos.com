// B"H
export function dialogueReport(dialogues = [], hooks = []) { return { dialogues:dialogues.length, hooks:hooks.length, nodes:dialogues.reduce((n,d)=>n+Object.keys(d.nodes||{}).length,0), choices:dialogues.reduce((n,d)=>n+Object.values(d.nodes||{}).reduce((m,node)=>m+(node.choices?.length||0),0),0) }; }
