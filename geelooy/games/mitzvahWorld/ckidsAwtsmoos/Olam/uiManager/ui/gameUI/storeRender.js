// B"H
export default function renderStore(store, items, playerItems, ui) {
    const grid = store.querySelector(".store-grid");
    const details = store.querySelector(".store-details");
    const tabs = store.querySelectorAll(".store-tab");
    
    tabs.forEach(t => {
        if(t.dataset.tab === store.activeTab) t.classList.add("active");
        else t.classList.remove("active");
    });
    
    grid.innerHTML = "";
    details.innerHTML = "";
    ui.html({
        parent: details,
        style: { opacity: "0.5", marginTop: "50px", textAlign: "center" },
        textContent: "Select an item to see details"
    });

    let itemsToRender = [];
    
    if (store.activeTab === 'buy') {
        itemsToRender = (items || []).map((itm, idx) => ({...itm, originalIndex: idx, type: 'buy'}));
    } else if (store.activeTab === 'sell') {
        if (playerItems) {
            playerItems.forEach((itm, idx) => {
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
            ui.html({
                parent: grid,
                style: { gridColumn: "1/-1", textAlign: "center", padding: "20px", color: "#aaa" },
                textContent: msg
            });
    } else {
        itemsToRender.forEach(item => {
            let iconStyle = {};
            let textIcon = null;
            
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
}