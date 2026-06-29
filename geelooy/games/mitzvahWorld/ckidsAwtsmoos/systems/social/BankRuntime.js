// B"H
/** Bank runtime with openBank compatibility. */
export function createBankRuntime(store={}){ const bank=store.bank||=[]; return { deposit(item){bank.push({...item,storedAt:Date.now()});return bank.length;}, withdraw(id){const i=bank.findIndex(x=>x.id===id);return i>=0?bank.splice(i,1)[0]:null;}, list(){return bank.map(x=>({...x}));} }; }
<<<<<<< HEAD
export function openBank(olam={}){ const owner=olam.player||olam.chossid||olam; owner.bank ||= []; const payload={ open:true, title:"Village Bank", slots:owner.bank.map(x=>({...x})), capacity:48 }; olam.ayshPeula?.("ui event","bankScreen",payload); return payload; }
=======
export function openBank(store=globalThis.__MITZVAH_WORLD_STATE__||{}) { const runtime=createBankRuntime(store); return { items:runtime.list() }; }
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
export default createBankRuntime;
