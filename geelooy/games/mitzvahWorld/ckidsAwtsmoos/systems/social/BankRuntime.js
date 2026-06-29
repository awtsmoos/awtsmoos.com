// B"H
/** Bank runtime with openBank compatibility. */
export function createBankRuntime(store = {}) {
  const bank = store.bank ||= [];
  return {
    deposit(item) { bank.push({ ...item, storedAt:Date.now() }); return bank.length; },
    withdraw(id) { const index = bank.findIndex(x => x.id === id); return index >= 0 ? bank.splice(index, 1)[0] : null; },
    list() { return bank.map(x => ({ ...x })); }
  };
}

export function openBank(target = globalThis.__MITZVAH_WORLD_STATE__ || {}) {
  const owner = target.player || target.chossid || target;
  owner.bank ||= [];
  const payload = { open:true, title:"Village Bank", slots:owner.bank.map(x => ({ ...x })), capacity:48, items:owner.bank.map(x => ({ ...x })) };
  target.ayshPeula?.("ui event", "bankScreen", payload);
  return payload;
}

export default createBankRuntime;
