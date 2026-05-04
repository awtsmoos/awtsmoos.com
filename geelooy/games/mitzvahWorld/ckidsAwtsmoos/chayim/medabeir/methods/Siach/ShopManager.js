// B"H
/**
 * @file ShopManager.js
 * @module ShopManager
 * 
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE MARKETPLACE OF SOULS — BUYING AND SELLING                                  ║
 * ║                                                                                  ║
 * ║  "Buy truth, and do not sell it; get wisdom, discipline, and understanding."    ║
 * ║  (Mishlei 23:23)                                                                ║
 * ║                                                                                  ║
 * ║  This module manages the commerce between the Chossid and the NPCs.              ║
 * ║  It integrates with the inventory system to allow purchasing of tools,           ║
 * ║  bricks, clothes, and other items.                                               ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

import AwtsmoosHTMLGenerator from "../../../../utils/ui/AwtsmoosHTMLGenerator.js";

export default class ShopManager {
    constructor(npc, olam) {
        this.npc = npc;
        this.olam = olam;
        this.view = "buy"; // "buy" or "sell"
        this.shopInventory = npc.options.shopInventory || [];
    }

    /**
     * Starts the shopping experience
     */
    openShop(chossid) {
        this.chossid = chossid;
        // B"H: silent

        this.renderUI();
    }

    /**
     * Closes the shop
     */
    closeShop() {
        // B"H: silent

        this.olam.ayshPeula("ui event", "shopScreen", { hideShop: true });
        if (this.npc.siach) {
            this.npc.siach.render(); // return to dialogue
        }
    }

    /**
     * Handles buying an item
     */
    buyItem(itemId) {
        const item = this.shopInventory.find(i => i.id === itemId);
        if (!item) return;

        const playerMoney = this.chossid.currency || 0;
        if (playerMoney < item.price) {
            this.olam.ayshPeula("ui event", "effectsOverlay", { text: "Not enough Shekels!", color: "red" });
            return;
        }
        
        // B"H: silent

        this.chossid.currency -= item.price;
        
        if (this.chossid.inventory) {
            this.chossid.inventory.addItem({
                id: item.id,
                name: item.name,
                description: item.description,
                className: item.className || "Brick",
                icon: item.icon,
                price: item.price
            });
            this.olam.ayshPeula("ui event", "toast", { message: "Purchased " + item.name + "!" });
            this.renderUI(); // Refresh UI for money update
        }
        if (this.chossid.updateStatsUI) this.chossid.updateStatsUI();
    }

    /**
     * Handles selling an item
     */
    sellItem(itemIndex) {
        if (!this.chossid.inventory || !this.chossid.inventory.slots) return;
        const item = this.chossid.inventory.slots[itemIndex];
        if (!item) return;

        // Sell price is usually 50% of buy price or a base value
        const sellPrice = item.sellValue || Math.floor((item.price || 10) * 0.6);
        
        // B"H: silent

        this.chossid.currency = (this.chossid.currency || 0) + sellPrice;
        
        this.chossid.inventory.removeItem(itemIndex);
        this.olam.ayshPeula("ui event", "toast", { message: "Sold " + item.name + " for " + sellPrice + " Shekels!" });
        
        this.renderUI();
        if (this.chossid.updateStatsUI) this.chossid.updateStatsUI();
    }

    /**
     * Renders the Shop UI via Malchus
     */
    renderUI() {
        let itemsJson = [];

        if (this.view === "buy") {
            itemsJson = this.shopInventory.map(item => ({
                className: "shop-item",
                style: { padding: "10px", border: "1px solid rgba(255,215,0,0.3)", borderRadius: "10px", marginBottom: "10px", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center" },
                children: [
                    { tag: "div", style: { fontSize: "2em", marginRight: "15px" }, text: item.icon || "📦" },
                    { tag: "div", style: { flexGrow: "1" }, children: [
                        { tag: "h3", style: { margin: "0", color: "#ffd700" }, text: item.name },
                        { tag: "p", style: { margin: "5px 0", color: "#ddd", fontSize: "0.8em" }, text: item.description || "A holy vessel." },
                        { tag: "div", style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                            { tag: "span", style: { color: "#00e5ff" }, text: item.price + " Coins" },
                            { tag: "button", className: "mitzvahBtn shop-buy-btn", attributes: { "data-id": item.id }, style: { padding: "5px 15px", fontSize: "0.8em" }, text: "Buy" }
                        ]}
                    ]}
                ]
            }));
        } else {
            // Sell View
            const slots = this.chossid.inventory.slots || [];
            slots.forEach((item, index) => {
                if (!item) return;
                const sellPrice = item.sellValue || Math.floor((item.price || 10) * 0.6);
                itemsJson.push({
                    className: "shop-item",
                    style: { padding: "10px", border: "1px solid rgba(0,229,255,0.3)", borderRadius: "10px", marginBottom: "10px", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center" },
                    children: [
                        { tag: "div", style: { fontSize: "2em", marginRight: "15px" }, text: item.icon || "📦" },
                        { tag: "div", style: { flexGrow: "1" }, children: [
                            { tag: "h3", style: { margin: "0", color: "#00e5ff" }, text: item.name },
                            { tag: "div", style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                                { tag: "span", style: { color: "#ffd700" }, text: sellPrice + " Coins" },
                                { tag: "button", className: "mitzvahBtn shop-sell-btn", attributes: { "data-index": index }, style: { padding: "5px 15px", fontSize: "0.8em", background: "linear-gradient(135deg, #00c853, #64dd17)" }, text: "Sell" }
                            ]}
                        ]}
                    ]
                });
            });
            if (itemsJson.length === 0) {
                itemsJson.push({ tag: "p", style: { textAlign: "center", color: "#999" }, text: "Your inventory is empty of sellable items." });
            }
        }

        const uiBlueprint = {
            className: "shop-container",
            style: { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "400px", maxHeight: "80vh", overflowY: "auto", background: "var(--glass-bg)", backdropFilter: "blur(20px)", border: "1px solid var(--glass-border)", borderRadius: "20px", padding: "20px", zIndex: "10001", pointerEvents: "auto", color: "white", fontFamily: "'Inter', sans-serif" },
            children: [
                { tag: "div", style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }, children: [
                    { tag: "h2", style: { margin: "0", color: "#ffd700", fontFamily: "'Fredoka One'" }, text: this.npc.name + "'s Shop" },
                    { tag: "button", className: "shop-close-btn", style: { background: "transparent", border: "none", color: "white", fontSize: "1.5em", cursor: "pointer" }, text: "×" }
                ]},
                { tag: "div", style: { color: "#00e5ff", fontWeight: "bold", marginBottom: "15px", textAlign: "center", fontSize: "1.2em" }, text: "Your Wallet: " + (this.chossid.currency || 0) + " Shekels" },
                { tag: "div", style: { display: "flex", gap: "10px", marginBottom: "20px" }, children: [
                    { tag: "button", className: "mitzvahBtn view-buy-btn", style: { flex: "1", opacity: this.view === 'buy' ? "1" : "0.5" }, text: "Buy" },
                    { tag: "button", className: "mitzvahBtn view-sell-btn", style: { flex: "1", opacity: this.view === 'sell' ? "1" : "0.5", background: "linear-gradient(135deg, #00c853, #64dd17)" }, text: "Sell" }
                ]},
                { className: "shop-items", children: itemsJson }
            ]
        };

        const uiHtml = AwtsmoosHTMLGenerator.emanate(uiBlueprint);

        this.olam.ayshPeula("ui event", "shopScreen", {
            html: uiHtml,
            styles: ".shop-container::-webkit-scrollbar { width: 8px; } .shop-container::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius:10px; } .shop-container::-webkit-scrollbar-thumb { background: #ffd700; border-radius:10px; }",
            setupListeners: () => {
                document.querySelectorAll(".shop-buy-btn").forEach(btn => {
                    btn.onclick = () => this.buyItem(btn.getAttribute("data-id"));
                });
                document.querySelectorAll(".shop-sell-btn").forEach(btn => {
                    btn.onclick = () => this.sellItem(parseInt(btn.getAttribute("data-index")));
                });
                const buyBtn = document.querySelector(".view-buy-btn");
                const sellBtn = document.querySelector(".view-sell-btn");
                if (buyBtn) buyBtn.onclick = () => { this.view = "buy"; this.renderUI(); };
                if (sellBtn) sellBtn.onclick = () => { this.view = "sell"; this.renderUI(); };
                
                const closeBtn = document.querySelector(".shop-close-btn");
                if(closeBtn) closeBtn.onclick = () => this.closeShop();
            }
        });
    }
}
