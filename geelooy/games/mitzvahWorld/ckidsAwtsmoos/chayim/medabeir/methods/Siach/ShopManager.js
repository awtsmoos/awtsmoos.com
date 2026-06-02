// B"H
/**
 * @file ShopManager.js
 * @description
 * Chapter 8: The marketplace no longer collapses when opened without a wallet.
 * The Awtsmoos guards every coin read, prefers personal perutas / bag values,
 * and renders a centered mobile-safe panel through the UI bridge.
 */
import AwtsmoosHTMLGenerator from "../../../../utils/ui/AwtsmoosHTMLGenerator.js";

const moneyOf = player => Number(player?.currency ?? player?.personalPerutas ?? player?.inventory?.personalPerutas ?? player?.inventory?.perutas ?? 0) || 0;
function setMoney(player, value) {
  if (!player) return;
  const next = Math.max(0, Number(value) || 0);
  if ("currency" in player) player.currency = next;
  else player.personalPerutas = next;
  if (player.inventory) player.inventory.personalPerutas = next;
}
function itemClass(item) { return item.className || (item.equipSlot ? "Clothing" : "Item"); }

export default class ShopManager {
  constructor(npc, olam) {
    this.npc = npc;
    this.olam = olam;
    this.view = "buy";
    this.shopInventory = npc?.options?.shopInventory || npc?.shopInventory || [];
  }

  openShop(chossid) {
    this.chossid = chossid || this.olam?.chossid || this.olam?.player || null;
    if (!this.chossid) return false;
    this.renderUI();
    return true;
  }

  closeShop() {
    this.olam?.ayshPeula?.("ui event", "shopScreen", { hideShop: true });
    if (this.npc?.siach) this.npc.siach.render();
  }

  buyItem(itemId) {
    const item = this.shopInventory.find(i => i.id === itemId);
    if (!item || !this.chossid) return;
    const wallet = moneyOf(this.chossid);
    if (wallet < Number(item.price || 0)) return this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: "Not enough bag perutas!", color: "#ff6b6b" });
    setMoney(this.chossid, wallet - Number(item.price || 0));
    this.chossid.inventory?.addItem?.({ ...item, className: itemClass(item), price: Number(item.price || 0), sellValue: Number(item.sellValue || Math.floor(Number(item.price || 0) * 0.5)) });
    this.olam?.ayshPeula?.("ui event", "toast", { message: `Bought ${item.name}` });
    this.chossid.applyGarments?.();
    this.renderUI();
  }

  sellItem(itemIndex) {
    const slots = this.chossid?.inventory?.slots || [];
    const item = slots[itemIndex];
    if (!item) return;
    const sellPrice = Number(item.sellValue || Math.floor((item.price || 2) * 0.6));
    setMoney(this.chossid, moneyOf(this.chossid) + sellPrice);
    this.chossid.inventory.removeItem?.(itemIndex);
    this.olam?.ayshPeula?.("ui event", "toast", { message: `Sold ${item.name} for ${sellPrice}` });
    this.renderUI();
  }

  renderUI() {
    if (!this.chossid) return;
    const rows = this.view === "buy" ? this.buyRows() : this.sellRows();
    const html = AwtsmoosHTMLGenerator.emanate(this.blueprint(rows));
    this.olam?.ayshPeula?.("ui event", "shopScreen", { html, styles: this.styles(), setupListeners: () => this.setupListeners() });
  }

  buyRows() {
    return this.shopInventory.map(item => this.row(item, item.price, "Buy", "shop-buy-btn", { "data-id": item.id }));
  }

  sellRows() {
    const slots = this.chossid?.inventory?.slots || [];
    const rows = [];
    slots.forEach((item, index) => { if (item) rows.push(this.row(item, item.sellValue || Math.floor((item.price || 2) * 0.6), "Sell", "shop-sell-btn", { "data-index": index })); });
    return rows.length ? rows : [{ tag: "p", style: { textAlign: "center", color: "#4a3512" }, text: "No sellable items yet." }];
  }

  row(item, price, verb, klass, attrs) {
    return { className: "shop-item", children: [{ tag: "div", className: "shop-icon", text: item.icon || "📦" }, { tag: "div", className: "shop-info", children: [{ tag: "h3", text: item.name }, { tag: "p", text: item.description || "Holy clothing vessel." }, { tag: "b", text: `${price || 0} perutas` }] }, { tag: "button", className: `shop-action ${klass}`, attributes: attrs, text: verb }] };
  }

  blueprint(rows) {
    return { className: "shop-container", children: [{ className: "shop-head", children: [{ tag: "h2", text: `${this.npc?.name || "Guide"} Shop` }, { tag: "button", className: "shop-close-btn", text: "×" }] }, { className: "shop-wallet", text: `Bag: ${moneyOf(this.chossid)} perutas` }, { className: "shop-tabs", children: [{ tag: "button", className: "view-buy-btn", text: "Buy" }, { tag: "button", className: "view-sell-btn", text: "Sell" }] }, { className: "shop-items", children: rows }] };
  }

  setupListeners() {
    document.querySelectorAll(".shop-buy-btn").forEach(btn => { btn.onclick = () => this.buyItem(btn.getAttribute("data-id")); });
    document.querySelectorAll(".shop-sell-btn").forEach(btn => { btn.onclick = () => this.sellItem(Number(btn.getAttribute("data-index"))); });
    document.querySelector(".view-buy-btn")?.addEventListener("click", () => { this.view = "buy"; this.renderUI(); });
    document.querySelector(".view-sell-btn")?.addEventListener("click", () => { this.view = "sell"; this.renderUI(); });
    document.querySelector(".shop-close-btn")?.addEventListener("click", () => this.closeShop());
  }

  styles() {
    return `.shop-container{position:fixed;inset:auto 12px 86px 12px;max-width:620px;margin:auto;background:#fff5c9;color:#1c1207;border:3px solid #d7aa45;border-radius:22px;padding:14px;z-index:30001;pointer-events:auto;font-family:Arial,sans-serif;box-shadow:0 12px 32px #0008}.shop-head{display:flex;justify-content:space-between;align-items:center}.shop-head h2{margin:0;font-size:24px}.shop-close-btn{font-size:30px;border:0;background:#8a5d17;color:white;border-radius:14px;width:50px;height:50px}.shop-wallet{text-align:center;font-weight:900;margin:8px}.shop-tabs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}.shop-tabs button,.shop-action{border:0;border-radius:14px;padding:12px;font-weight:900;background:#c37d0c;color:white}.shop-item{display:grid;grid-template-columns:52px 1fr 76px;gap:10px;align-items:center;background:#fffbe0;border:2px solid #d7aa45;border-radius:16px;padding:10px;margin:8px 0}.shop-icon{font-size:34px}.shop-info h3{margin:0;font-size:18px}.shop-info p{margin:3px 0;font-size:13px}`;
  }
}
