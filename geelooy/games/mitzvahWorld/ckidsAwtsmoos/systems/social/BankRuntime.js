// B"H
/**
 * BankRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function createBankRuntime(store={}){ const bank=store.bank||=[]; return { deposit(item){bank.push({...item,storedAt:Date.now()});return bank.length;}, withdraw(id){const i=bank.findIndex(x=>x.id===id);return i>=0?bank.splice(i,1)[0]:null;}, list(){return bank.map(x=>({...x}));} }; }
export default createBankRuntime;
