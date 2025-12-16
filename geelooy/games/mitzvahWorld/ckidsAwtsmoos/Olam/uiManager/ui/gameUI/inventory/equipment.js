
// B"H
export default function updateEquipment(e, $, ui) {
    const equipData = e.detail;
    const inventoryElement = $("inventoryScreen");
    if (!inventoryElement) return;
    const equipContainer = inventoryElement.querySelector(".equipment-slots");
    if (!equipContainer) return;
    equipContainer.innerHTML = "";
    const slotOrder = ["head", "shirt", "jacket", "legs", "feet", "rightHand", "leftHand"];

    slotOrder.forEach(slotName => {
        const item = equipData[slotName];
        let iconStyle = {};
        let className = 'slotBtn';
        let children = [];
        let textIcon = null;

        if (item) {
                const isUrl = item.icon && (item.icon.includes('/') || item.icon.includes('data:'));
                if (isUrl) {
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
                        width: "100%", height: "100%", 
                        backgroundSize: "contain", 
                        backgroundRepeat: "no-repeat", 
                        backgroundPosition: "center" 
                    };
                }
            } else if (item.icon) {
                textIcon = item.icon;
                iconStyle = {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '40px',
                    width: '100%',
                    height: '100%'
                };
            }
            children.push({ className: className, style: iconStyle, textContent: textIcon });
        }

        ui.html({
            parent: equipContainer,
            className: "equip-slot " + slotName,
            style: { width: "50px", height: "50px", border: "1px solid #888", background: "rgba(0,0,0,0.3)", position: "relative", margin: "2px", borderRadius: "4px", display: "flex", justifyContent: "center", alignItems: "center" },
            innerHTML: item ? "" : `<span style='font-size:10px; color:#aaa; text-transform:uppercase'>${slotName.replace("Hand", "")}</span>`,
            onclick: (ev) => {
                if (item) {
                    ui.peula("ikar", { olamPeula: { unequipItem: slotName } });
                }
            },
            children: children
        });
    });
}
