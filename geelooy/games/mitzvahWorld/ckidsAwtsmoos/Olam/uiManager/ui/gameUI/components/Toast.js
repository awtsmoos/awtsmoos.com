/**
 * B"H
 * @module ToastManager
 * @description
 * THE WHISPER OF THE WIND (RUA’CH)
 * 
 * Provides spectral feedback to the soul for every action.
 */
export const Toast = {
    shaym: "toast-container",
    className: "toast-container",
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
    
    show(message, type = "info", ui) {
        const toast = ui.html({
            parent: "toast-container",
            className: `toast toast-${type}`,
            style: {
                background: "rgba(10, 10, 30, 0.95)",
                border: `1px solid ${type === "error" ? "#ff4444" : "#00f3ff"}`,
                padding: "15px 30px",
                borderRadius: "15px",
                color: "white",
                fontFamily: "Outfit, sans-serif",
                fontWeight: "700",
                fontSize: "16px",
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
        }, 3000);
    },

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
