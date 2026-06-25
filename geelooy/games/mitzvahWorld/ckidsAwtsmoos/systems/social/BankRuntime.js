// B"H
/** Bank runtime with openBank compatibility. */
export function createBankRuntime(store={}){ const bank=store.bank||=[]; return { deposit(item){bank.push({...item,storedAt:Date.now()});return bank.length;}, withdraw(id){const i=bank.findIndex(x=>x.id===id);return i>=0?bank.splice(i,1)[0]:null;}, list(){return bank.map(x=>({...x}));} }; }
export function openBank(store=globalThis.__MITZVAH_WORLD_STATE__||{}) { const runtime=createBankRuntime(store); return { items:runtime.list() }; }
export default createBankRuntime;
