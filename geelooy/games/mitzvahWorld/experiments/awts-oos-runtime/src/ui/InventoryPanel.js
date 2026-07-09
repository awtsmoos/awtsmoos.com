// B"H
const ITEMS = [
  item('perutas', '🪙', 'Perutas', 'Currency', 'Small coins for tzedakah and future shop systems.', 18), item('bread', '🍞', 'Bread', 'Food', 'A warm loaf. Use can later restore koach.', 2),
  item('siddur', '📖', 'Siddur', 'Holy book', 'A prayer book for future avodah actions.', 1), item('door-key', '🗝️', 'Doorway Key', 'Quest', 'A test key for the hinged doorway vessel.', 1),
  item('apple', '🍎', 'Apple', 'Food', 'Sweet food for a future berachah/use system.', 3), item('water', '🫙', 'Water Flask', 'Drink', 'A flask ready for future thirst mechanics.', 1),
];
const EQUIP = [['head','🎩','Top hat','tophat'],['kippah','⚫','Yarmulke','yamulka'],['eyes','👓','Round glasses','glasses-frame'],['beard','🧔','Beard / peyos','hair'],['coat','🧥','Black jacket','jacket'],['outer','👕','Outer shirt','outer-shirt'],['shirt','🤍','White shirt','shirt'],['legs','👖','Pants','pants'],['feet','👞','Shoes','shoes'],['tefillin','◼️','Tefillin bayis','teffilinBayis'],['strap','➰','Tefillin strap','teffilinStrap']];

/** InventoryPanel: equipment paper-doll plus backpack grid and item action menus. */
export class InventoryPanel {
  constructor(host, bus, data = {}) { this.host = host || makeHost(); this.bus = bus; this.open = false; this.selected = null; this.materials = data.equipment?.materials || []; this.items = [...ITEMS]; this.build(); }
  build() { this.host.classList.add('awts-inventory-shell'); this.host.innerHTML = this.html(); this.panel = this.host.querySelector('.awts-inventory-panel'); this.panel.addEventListener('pointerdown', e => this.click(e)); this.bus.on('inventory:toggle', () => this.setOpen(!this.open)); this.bus.on('inventory:open', () => this.setOpen(true)); }
  html() { return `<section class="awts-inventory-panel" data-open="false" aria-hidden="true"><header><b>🎒 B"H Bag</b><span>${this.coinText()}</span><button data-close>×</button></header><div class="inv-body"><aside><h3>Wearing</h3><div class="equip-grid">${this.equipmentHtml()}</div></aside><main><h3>Backpack</h3><div class="bag-grid">${this.bagHtml()}</div><div class="item-card">${this.cardHtml()}</div></main></div></section>`; }
  equipmentHtml() { return EQUIP.map((e, i) => { const worn = this.materials.includes(e[3]); return `<button class="inv-slot equip" data-kind="equip" data-index="${i}"><span>${e[1]}</span><b>${e[2]}</b><small>${worn ? e[3] : 'ready'}</small></button>`; }).join(''); }
  bagHtml() { const cells = []; for (let i = 0; i < 24; i++) { const it = this.items[i]; cells.push(it ? `<button class="inv-slot" data-kind="item" data-index="${i}"><span>${it.icon}</span><b>${it.name}</b><small>${it.qty > 1 ? '×' + it.qty : it.type}</small></button>` : `<button class="inv-slot empty" data-kind="empty"><span>＋</span><b>Empty</b><small>future</small></button>`); } return cells.join(''); }
  cardHtml() { const s = this.selected; if (!s) return `<h4>Item details</h4><p>Tap any worn clothing or backpack item.</p>`; return `<h4>${s.icon || '✨'} ${esc(s.name)}</h4><p><b>${esc(s.type || s.slot || 'Vessel')}</b> — ${esc(s.summary)}</p><div class="item-actions"><button data-action="use">Use</button><button data-action="drop">Drop</button><button data-action="inspect">Inspect</button></div><output>${esc(s.note || '')}</output>`; }
  click(e) { const close = e.target.closest('[data-close]'); if (close) return this.setOpen(false); const action = e.target.closest('[data-action]'); if (action) return this.itemAction(action.dataset.action); const slot = e.target.closest('.inv-slot'); if (!slot) return; e.preventDefault(); this.select(slot.dataset.kind, Number(slot.dataset.index || 0)); }
  select(kind, index) { if (kind === 'item') this.selected = this.items[index]; else if (kind === 'equip') this.selected = equipItem(EQUIP[index], this.materials); else this.selected = { icon: '＋', name: 'Empty future slot', type: 'Future', summary: 'A hollow vessel waiting for an item.', note: '' }; this.refresh(); }
  itemAction(action) { if (!this.selected) return; const verbs = { use: 'Use prepared', drop: 'Drop is queued for later safe-world logic', inspect: 'Inspected actual inventory vessel' }; this.selected = { ...this.selected, note: `${verbs[action] || action}: ${this.selected.name}` }; this.refresh(); }
  refresh() { this.panel.querySelector('.item-card').innerHTML = this.cardHtml(); }
  setOpen(open) { this.open = !!open; this.panel.dataset.open = this.open ? 'true' : 'false'; this.panel.setAttribute('aria-hidden', this.open ? 'false' : 'true'); this.bus.emit('inventory:state', { open: this.open }); }
  coinText() { const c = this.items.find(i => i.id === 'perutas'); return `🪙 ${c?.qty || 0} perutas`; }
}
function item(id, icon, name, type, summary, qty = 1) { return { id, icon, name, type, summary, qty }; }
function equipItem(e, materials) { const found = materials.includes(e[3]); return { icon: e[1], name: e[2], type: 'Equipped clothing', slot: e[0], summary: `${found ? 'Found on the GLB material list' : 'Reserved equipment slot'}: ${e[3]}.`, note: '' }; }
function esc(s = '') { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
function makeHost() { const host = document.createElement('div'); document.body.append(host); return host; }
