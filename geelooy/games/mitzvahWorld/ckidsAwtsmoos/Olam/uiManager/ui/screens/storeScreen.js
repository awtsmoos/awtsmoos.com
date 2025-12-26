// B"H
// Store Screen Logic
import renderStore from '../gameUI/storeRender.js';

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
            renderStore(store, store.items, store.playerItems, ui);
        },
        
        showDetails(e, $, ui) {
            const item = e.detail;
            const details = $("storeScreen").querySelector(".store-details");
            details.innerHTML = "";
            
            const price = item.price;
            const tax = Math.ceil(price * 0.1); 
            const total = item.type === 'buy' ? price + tax : price; 

            let iconStyle = {};
            let textIcon = null;
             if (item.icon && (item.icon.includes('/') || item.icon.includes('data:'))) {
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
                        style: { fontSize: "18px", color: "#ffd700", margin: "10px 0", textAlign: "left", width: "100%", padding: "0 20px" },
                        innerHTML: item.type === 'buy' ? 
                            `Base: ${price}<br><span style='color:#ff9999'>Tax (10%): +${tax}</span><br><strong>Total: ${total}</strong>` : 
                            `Value: ${price}<br><span style='color:#99ff99'>Tax Deduction: -${tax}</span><br><strong>Receive: ${price-tax}</strong>`
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