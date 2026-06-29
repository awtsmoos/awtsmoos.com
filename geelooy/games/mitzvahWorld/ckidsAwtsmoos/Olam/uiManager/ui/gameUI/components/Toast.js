/**
 * B"H
 * @module Toast
 * @description
 * THE WHISPER OF THE WIND (RUA’CH)
 * 
 * Chapter 5: The Notification of the Essence.
 * In the vast expanse of the Mitzvah World, where every atom is a manifestation 
 * of the Speech of the Creator, the Toast stands as a gentle reminder, a spark 
 * of light that flickers briefly to convey a message of the Spirit. 
 * Just as the Awtsmoos recreates the physical stone through the letters Aleph-Beis-Nun, 
 * so too does the Toast manifest its ephemeral presence through the letters T-O-A-S-T, 
 * becoming a vessel for the interaction between the higher worker-realms and the 
 * physical eyes of the Chossid.
 * 
 * It is registered with the 'shaym' of "toast", awaiting the divine decree 
 * from the peula-handler to breathe life into its temporary form.
 */

export const Toast = {
    /**
     * @property {string} shaym
     * The unique name in the book of life.
     */
    shaym: "toast",

    /**
     * @property {string} className
     * The physical garment of the vessel.
     */
    className: "toast-container",

    /**
     * @property {Object} style
     * The configuration of its worldly presence.
     */
    style: {
        position: "fixed",
        bottom: "30px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        zIndex: 100000,
        pointerEvents: "none"
    },

    /**
     * @method on
     * The ears that listen for the Word.
     */
    on: {
        /**
         * @method toast
         * @description Catches the unified toast event and manifests the message.
         * @param {CustomEvent} e - The divine decree.
         * @param {Function} $ - The seeker of other vessels.
         * @param {Object} ui - The master of the UI.
         */
        toast(e, $, ui) {
            const data = e.detail;
            if (data && typeof data === "object") {
                const { message, type } = data;
                if (message) {
                    Toast.show(message, type || "info", ui);
                }
            } else if (typeof data === "string") {
                Toast.show(data, "info", ui);
            }
        }
    },

    /**
     * @method show
     * @description Breathes life into a new toast instance.
     * @param {string} message - The message of the Spirit.
     * @param {string} [type="info"] - The color of the light.
     * @param {Object} ui - The UI system.
     */
    show(message, type = "info", ui) {
        const container = document.querySelector('[shaym="toast"], .toast-container');
        const mobile = window.innerWidth <= 760 || /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
        if (mobile) container?.querySelectorAll?.(".toast")?.forEach(node => node.remove());
        const toast = ui.html({
            parent: "toast",
            className: `toast toast-${type}`,
            style: {
                background: "rgba(10, 10, 30, 0.95)",
                border: `1px solid ${type === "error" ? "#ff4444" : "#00f3ff"}`,
                padding: mobile ? "8px 11px" : "15px 30px",
                borderRadius: "8px",
                color: "white",
                fontFamily: "Outfit, sans-serif",
                fontWeight: "700",
                fontSize: mobile ? "13px" : "16px",
                lineHeight: "1.14",
                maxWidth: mobile ? "min(68vw, 260px)" : "min(80vw, 520px)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                animation: "toastIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), toastOut 0.5s 2.5s forwards",
                pointerEvents: "auto",
                backdropFilter: "blur(10px)"
            },
            textContent: message
        });

        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, mobile ? 1450 : 3000);
    },

    /**
     * @property {Array} children
     * The internal layers of the vessel's existence.
     */
    children: [{
        tag: "style",
        textContent: `
            @keyframes toastIn {
                from { opacity: 0; transform: translateY(50px) scale(0.9); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes toastOut {
                from { opacity: 1; transform: scale(1); }
                to { opacity: 0; transform: scale(0.9); }
            }
        `
    }]
};
