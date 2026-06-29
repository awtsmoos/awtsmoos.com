// B"H
/**
 * BankRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function createBankRuntime(store={}){ const bank=store.bank||=[]; return { deposit(item){bank.push({...item,storedAt:Date.now()});return bank.length;}, withdraw(id){const i=bank.findIndex(x=>x.id===id);return i>=0?bank.splice(i,1)[0]:null;}, list(){return bank.map(x=>({...x}));} }; }
export function openBank(olam={}){ const owner=olam.player||olam.chossid||olam; owner.bank ||= []; const payload={ open:true, title:"Village Bank", slots:owner.bank.map(x=>({...x})), capacity:48 }; olam.ayshPeula?.("ui event","bankScreen",payload); return payload; }
export default createBankRuntime;
