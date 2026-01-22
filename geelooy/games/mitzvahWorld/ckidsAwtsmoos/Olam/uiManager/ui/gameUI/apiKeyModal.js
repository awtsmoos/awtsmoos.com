// B"H
import ApiKeyManager from "../../../../ai/ApiKeyManager.js";

export default {
    shaym: "apiKeyModal",
    className: "api-key-modal hidden",
    awtsmoosClick: true,
    style: {
        position: "fixed", top: "0", left: "0", width: "100%", height: "100%",
        backgroundColor: "rgba(0,0,0,0.8)", zIndex: 10000,
        display: "flex", justifyContent: "center", alignItems: "center",
        backdropFilter: "blur(5px)"
    },
    on: {
        open(e, $, ui) {
            $("apiKeyModal").classList.remove("hidden");
            const input = $("api-keys-input");
            input.value = ApiKeyManager.getKeys().join(",\n");
            input.focus();
        }
    },
    children: [
        {
            className: "ak-content",
            style: {
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                border: "2px solid #00f3ff", borderRadius: "15px", padding: "30px",
                width: "90%", maxWidth: "500px", color: "white",
                boxShadow: "0 0 30px rgba(0, 243, 255, 0.3)",
                display: "flex", flexDirection: "column", gap: "15px",
                fontFamily: "'Fredoka', sans-serif"
            },
            children: [
                { tag: "h2", textContent: "Divine Intelligence Required", style: { margin: 0, color: "#00f3ff" } },
                { 
                    tag: "p", 
                    innerHTML: "To enable the souls to speak, you must provide <strong>Gemini API Keys</strong>.<br>Enter multiple keys separated by commas or new lines to handle quotas.",
                    style: { fontSize: "14px", lineHeight: "1.5", opacity: 0.8 } 
                },
                {
                    tag: "a", 
                    href: "https://aistudio.google.com/app/apikey", 
                    target: "_blank",
                    textContent: "Get API Keys Here (Opens in new tab)",
                    style: { color: "#ffd700", textDecoration: "underline", fontWeight: "bold" }
                },
                {
                    tag: "textarea",
                    shaym: "api-keys-input",
                    placeholder: "Paste keys here...",
                    style: {
                        width: "100%", height: "150px", background: "rgba(255,255,255,0.1)",
                        border: "1px solid #444", color: "#00ff00", padding: "10px",
                        fontFamily: "monospace", borderRadius: "5px", resize: "none"
                    }
                },
                {
                    style: { display: "flex", justifyContent: "flex-end", gap: "10px" },
                    children: [
                        {
                            tag: "button", className: "awtsmoosBtn", textContent: "Cancel",
                            style: { background: "transparent", border: "1px solid #ff4757", color: "#ff4757" },
                            onclick(e, $) { $("apiKeyModal").classList.add("hidden"); }
                        },
                        {
                            tag: "button", className: "awtsmoosBtn", textContent: "Save Keys",
                            onclick(e, $) {
                                const val = $("api-keys-input").value;
                                // Split by comma or newline
                                const keys = val.split(/[\n,]+/).map(k => k.trim()).filter(k => k);
                                ApiKeyManager.saveKeys(keys);
                                $("apiKeyModal").classList.add("hidden");
                                alert(`B"H - ${keys.length} keys saved.`);
                            }
                        }
                    ]
                }
            ]
        }
    ]
};
