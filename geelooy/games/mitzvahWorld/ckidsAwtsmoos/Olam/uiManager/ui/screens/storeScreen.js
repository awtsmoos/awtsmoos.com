

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
            
            // B"H: Hide interaction prompts when store opens
            ui.htmlAction({
                shaym: "approach npc msg",
                methods: { classList: { add: "hidden" } }
            });
            
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
                        // B"H: Ensure we check for item existence and sellValue
                        // Even if sellValue isn't explicitly > 0, if it's an item, show it?
                        // Let's stick to items with value for now, but ensure properties exist.
                        // We filter nulls (empty slots).
                        if(itm && itm.sellValue > 0 && itm.className !== 'Coin') {
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
                    // B"H: Icon rendering logic
                    let iconStyle = {};
                    let textIcon = null;
                    
                    // Fallback default icon if missing
                    if(!item.icon) item.icon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzQ0NCIgc3Ryb2tlPSIjODg4IiBzdHJva2Utd2lkdGg9IjUiLz48dGV4dCB4PSI1MCIgeT0iNjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmYiIGZvbnQtc2l6ZT0iNDAiPj88L3RleHQ+PC9zdmc+";

                    if (item.icon && (item.icon.includes('/') || item.icon.includes('data:'))) {
                         if (item.isTintable && item.customData && item.customData.color) {
                            const color = item.customData.color;
                            iconStyle = {
                                backgroundColor: color,
                                maskImage: `url(${item.icon})`,
                                WebkitMaskImage: `url(${item.icon})`,
                                maskSize: "contain",
                                WebkitMaskSize: "contain",
                                maskRepeat: "no-repeat",
                                WebkitMaskRepeat: "no-repeat",
                                maskPosition: "center",
                                WebkitMaskPosition: "center",
                                width: "100%", height: "100%"
                            };
                        } else {
                            iconStyle = { 
                                backgroundImage: `url(${item.icon})`,
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                width: '100%', height: '100%'
                            };
                        }
                    } else if (item.icon) {
                        textIcon = item.icon;
                        iconStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '30px' };
                    } else {
                         // Fallback Text Icon
                         textIcon = (item.name || "?").charAt(0);
                         iconStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '30px', background: "#555", borderRadius: "50%", width:"50px", height:"50px", margin: "10px auto" };
                    }

                    ui.html({
                        parent: grid,
                        className: "store-item" + (item.isEquipped ? " locked" : ""),
                        onclick: () => {
                            if (!item.isEquipped) {
                                ui.peula(store, { showDetails: item });
                            }
                        },
                        children: [
                            { 
                                className: "store-item-icon", 
                                style: iconStyle,
                                textContent: textIcon
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
            
            // Icon for details
            let iconStyle = {};
            let textIcon = null;
             if (item.icon && (item.icon.includes('/') || item.icon.includes('data:'))) {
                 // Simplified for details: just image if not complex
                  if (item.isTintable && item.customData && item.customData.color) {
                       iconStyle = {
                            backgroundColor: item.customData.color,
                            maskImage: `url(${item.icon})`,
                            WebkitMaskImage: `url(${item.icon})`,
                            maskSize: "contain",
                            WebkitMaskSize: "contain",
                            maskRepeat: "no-repeat",
                            WebkitMaskRepeat: "no-repeat",
                            maskPosition: "center",
                            width: "100px", height: "100px", margin:'0 auto'
                        };
                  } else {
                      iconStyle = { backgroundImage: `url(${item.icon})`, width:'100px', height:'100px', margin:'0 auto', backgroundSize:'contain', backgroundRepeat:'no-repeat', backgroundPosition:'center' };
                  }
             } else if (item.icon) {
                 textIcon = item.icon;
                 iconStyle = { fontSize: '60px', textAlign:'center', display:'block', margin:'0 auto' };
             } else {
                 textIcon = (item.name || "?").charAt(0);
                 iconStyle = { fontSize: '60px', textAlign:'center', display:'flex', justifyContent:'center', alignItems:'center', background:'#444', borderRadius:'50%', width:'100px', height:'100px', margin:'0 auto' };
             }

            ui.html({
                parent: details,
                children: [
                    { 
                        className: "store-item-icon large", 
                        style: iconStyle,
                        textContent: textIcon
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
