// B"H
/**
 * @file actionBar.js
 * @description
 * Chapter 17: The bag becomes a retractable little moon.
 *
 * The Awtsmoos keeps the inventory vessel alive, but contracts its footprint.
 * A gold arrow folds the dock away. The backpack toggles the treasury directly,
 * without waiting for older action-slot machinery to remember its name.
 */
function toggleInventory() {
  const inv = document.getElementById("inventoryScreen") || document.querySelector('[shaym="inventoryScreen"]');
  if (inv) inv.classList.toggle("hidden");
}

function toggleDock(host) {
  const dock = host?.closest?.("#actionBar") || document.getElementById("actionBar");
  if (dock) dock.classList.toggle("retracted");
}

const ActionBar = {
  shaym: "action bar",
  id: "actionBar",
  className: "awtsmoosAction compact-action-dock",
  awtsmoosClick: true,
  style: { pointerEvents: "auto" },
  children: [
    {
      className: "dock-arrow opened",
      textContent: "›",
      onclick(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleDock(e.currentTarget);
      }
    },
    {
      className: "slots",
      shaym: "action slots",
      id: "actionSlots",
      children: [
        {
          className: "actionSlot occupied bag-slot",
          onclick(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleInventory();
          },
          children: [{ className: "innerSlot", children: [{ className: "slotBtn", textContent: "🎒" }] }]
        }
      ]
    },
    {
      tag: "style",
      innerHTML: `
        .compact-action-dock {
          position: fixed !important;
          right: 16px !important;
          top: 42% !important;
          transform: translateY(-50%) !important;
          width: 76px !important;
          height: 76px !important;
          z-index: 12001 !important;
          pointer-events: auto !important;
          transition: transform .22s ease, right .22s ease !important;
        }
        .compact-action-dock.retracted { right: -58px !important; }
        .compact-action-dock .dock-arrow {
          position: absolute !important;
          left: -22px !important;
          top: 21px !important;
          width: 24px !important;
          height: 34px !important;
          border-radius: 14px 0 0 14px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: #ffdf55 !important;
          background: rgba(20, 8, 46, .86) !important;
          border: 2px solid rgba(255, 215, 0, .55) !important;
          border-right: none !important;
          font: bold 22px Arial, sans-serif !important;
          pointer-events: auto !important;
          user-select: none !important;
        }
        .compact-action-dock.retracted .dock-arrow { transform: rotate(180deg) !important; }
        .compact-action-dock .slots { width: 76px !important; height: 76px !important; pointer-events: auto !important; }
        .compact-action-dock .actionSlot:not(.bag-slot) { display: none !important; }
        .compact-action-dock .bag-slot {
          width: 76px !important;
          height: 76px !important;
          border-radius: 18px !important;
          background: rgba(13,4,52,.72) !important;
          border: 2px solid rgba(255,215,0,.55) !important;
          box-shadow: 0 7px 14px rgba(0,0,0,.42) !important;
          pointer-events: auto !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .compact-action-dock .innerSlot, .compact-action-dock .slotBtn {
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 38px !important;
        }
      `
    }
  ],
  on: {
    updateActionSlots() {}
  }
};

export default ActionBar;
