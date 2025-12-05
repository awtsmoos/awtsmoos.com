
// B"H
// Store Screen Logic

export default {
    shaym: "storeScreen",
    className: "store-container hidden",
    awtsmoosClick: true,
    activeTab: 'buy',
    npcId: null,
    
    on: {
        open(e, $, ui) {
            const data = e.detail; 
            const store = $("storeScreen");
            store.classList.remove("hidden");
            store.npcId = data.entityId;
            
            const title = store.querySelector(".store-title");
            if(title) title.textContent = data.npcName + "'s Store";
            
            store.activeTab = data.mode || 'buy';
            store.items = data.items;
            store.playerItems = data.playerInventory;
            
            ui.peula(store, { render: true });
        },
        
        update(e, $, ui) {
             const data = e.detail;
             const store = $("storeScreen");
             if(data.items) store.items = data.items;
             if(data.playerInventory) store.playerItems = data.playerInventory;
             ui.peula(store, { render: true });
        },
        
        close(e, $, ui) {
            $("storeScreen").classList.add("hidden");
        },
        
        render(e, $, ui) {
            const store = $("storeScreen");
            const grid = store.querySelector(".store-grid");
            const details = store.querySelector(".store-details");
            const tabs = store.querySelectorAll(".store-tab");
            
            tabs.forEach(t => {
                if(t.dataset.tab === store.activeTab) t.classList.add("active");
                else t.classList.remove("active");
            });
            
            grid.innerHTML = "";
            details.innerHTML = "<div style='opacity:0.5; margin-top:50px;'>Select an item to see details</div>";

            let itemsToRender = [];
            
            if (store.activeTab === 'buy') {
                itemsToRender = (store.items || []).map((itm, idx) => ({...itm, originalIndex: idx, type: 'buy'}));
            } else if (store.activeTab === 'sell') {
                if (store.playerItems) {
                    store.playerItems.forEach((itm, idx) => {
                        if(itm && itm.sellValue && itm.sellValue > 0 && itm.className !== 'Coin') {
                            itemsToRender.push({
                                ...itm, 
                                price: itm.sellValue,
                                originalIndex: idx, 
                                type: 'sell'
                            });
                        }
                    });
                }
            }

            if (itemsToRender.length === 0) {
                 const msg = store.activeTab === 'sell' ? "No valuables found to sell!" : "Nothing here!";
                 grid.innerHTML = `<div style='grid-column: 1/-1; text-align:center; padding:20px; color:#aaa;'>${msg}</div>`;
            } else {
                itemsToRender.forEach(item => {
                    ui.html({
                        parent: grid,
                        className: "store-item" + (item.isEquipped ? " locked" : ""),
                        onclick: () => {
                            if (!item.isEquipped) {
                                ui.peula(store, { showDetails: item });
                            }
                        },
                        on: {
                            mouseenter(ev) {
                                const tooltip = document.createElement("div");
                                tooltip.className = "awtsmoos-tooltip";
                                tooltip.innerHTML = `<strong>${item.name}</strong><br>${item.type === 'buy' ? 'Cost' : 'Value'}: ${item.price}`;
                                tooltip.style.left = ev.pageX + 10 + "px";
                                tooltip.style.top = ev.pageY + 10 + "px";
                                document.body.appendChild(tooltip);
                                ev.target._tooltip = tooltip;
                            },
                            mouseleave(ev) {
                                if(ev.target._tooltip) ev.target._tooltip.remove();
                            }
                        },
                        children: [
                            { 
                                className: "store-item-icon", 
                                style: { backgroundImage: item.icon ? `url(${item.icon})` : 'none' } 
                            },
                            { className: "store-item-qty", textContent: item.quantity || 1 },
                            item.isEquipped ? { className: "locked-icon", textContent: "🔒" } : null
                        ]
                    });
                });
            }
        },
        
        showDetails(e, $, ui) {
            const item = e.detail;
            const details = $("storeScreen").querySelector(".store-details");
            details.innerHTML = "";
            
            ui.html({
                parent: details,
                children: [
                    { 
                        className: "store-item-icon large", 
                        style: { backgroundImage: item.icon ? `url(${item.icon})` : 'none', width:'100px', height:'100px', margin:'0 auto' } 
                    },
                    { tag: "h3", textContent: item.name },
                    { textContent: item.description || "No description available." },
                    { 
                        tag: "div", 
                        style: { fontSize: "18px", color: "#ffd700", margin: "10px 0" },
                        textContent: item.type === 'buy' ? `Cost: ${item.price} Perutahs` : `Value: ${item.price} Perutahs` 
                    },
                    {
                        tag: "button",
                        className: "action-btn",
                        textContent: item.type === 'buy' ? "BUY" : "SELL",
                        disabled: item.isEquipped,
                        onclick: () => {
                            if(item.isEquipped) return;
                            ui.peula("ikar", {
                                olamPeula: {
                                    htmlPeula: {
                                        shopAction: {
                                            action: item.type,
                                            payload: { 
                                                index: item.originalIndex, 
                                                originalIndex: item.originalIndex 
                                            },
                                            entityId: $("storeScreen").npcId
                                        }
                                    }
                                }
                            });
                        }
                    }
                ]
            });
        }
    },
    
    children: [
        {
            className: "store-header",
            children: [
                { className: "store-title", textContent: "Store" },
                { 
                    tag: "button", className: "awtsmoosBtn", textContent: "Close",
                    onclick(e, $) { $("storeScreen").classList.add("hidden"); }
                }
            ]
        },
        {
            className: "store-tabs",
            children: [
                { 
                    className: "store-tab", textContent: "BUY", dataset: { tab: 'buy' },
                    onclick(e, $, ui) { $("storeScreen").activeTab = 'buy'; ui.peula($("storeScreen"), { render: true }); }
                },
                { 
                    className: "store-tab", textContent: "SELL", dataset: { tab: 'sell' },
                    onclick(e, $, ui) { $("storeScreen").activeTab = 'sell'; ui.peula($("storeScreen"), { render: true }); }
                },
                {
                    className: "store-tab", textContent: "EXCHANGE", dataset: { tab: 'exchange' },
                    onclick(e, $, ui) {
                         ui.peula("ikar", {
                            olamPeula: { htmlPeula: { shopAction: { action: 'exchange', entityId: $("storeScreen").npcId } } }
                        });
                    }
                }
            ]
        },
        {
            className: "store-content",
            children: [
                { className: "store-grid" },
                { className: "store-details" }
            ]
        }
    ]
};
