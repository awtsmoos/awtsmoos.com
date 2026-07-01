// B"H
function awtsmoosNotice(message) {
  const text = String(message ?? "");
  console.warn('B"H | NOTICE_NO_BLOCKING_DIALOG', text);
  globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__ ||= [];
  globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__.push({ at: Date.now(), text, source: import.meta?.url || "unknown" });
  globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__ = globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__.slice(-80);
}

/**
 * B"H
 */
export default {
    shaym: "apiKeyModal",
    className: "api-key-modal hidden",
    awtsmoosClick: true,
    style: {
        position: "fixed", inset: "0px",
        backgroundColor: "rgba(0,0,0,0.85)", zIndex: 10000,
        display: "flex", justifyContent: "center", alignItems: "center",
        backdropFilter: "blur(8px)"
    },
    on: {
        open(e, $, ui) {
            $("apiKeyModal").classList.remove("hidden");
            const input = $("api-keys-input");
            const existing = localStorage.getItem("AWTSMOOS_GEMINI_KEYS");
            input.value = existing ? JSON.parse(existing).join(", ") : "";
        }
    },
    children: [
        {
            style: {
                background: "linear-gradient(135deg, #1b0d3a 0%, #0d041e 100%)",
                border: "2px solid #00f3ff", borderRadius: "12px", padding: "30px",
                width: "90%", maxWidth: "450px", color: "#fff", display: "flex", flexDirection: "column", gap: "15px",
                fontFamily: "'Fredoka', sans-serif"
            },
            children: [
                { tag: "h3", textContent: "Gemini AI Connection", style: { margin:0, color: "#00f3ff" } },
                { tag: "p", innerHTML: "Unlock the souls' speech! Enter one or more API keys (comma-separated):", style: { fontSize: "14px", opacity: 0.8 } },
                {
                    tag: "textarea", shaym: "api-keys-input", placeholder: "Key 1, Key 2...",
                    style: {
                        background: "#000", border: "1px solid #444", color: "#0f0",
                        padding: "10px", height: "100px", borderRadius: "8px", fontFamily: "monospace"
                    }
                },
                {
                    style: { display: "flex", gap: "10px", justifyContent: "flex-end" },
                    children: [
                        {
                            tag: "button", textContent: "Cancel", className: "awtsmoosBtn", 
                            style: { background:"transparent", border: "1px solid #ff4757", color:"#ff4757" },
                            onclick: () => $("apiKeyModal").classList.add("hidden")
                        },
                        {
                            tag: "button", textContent: "Save & Ignite", className: "awtsmoosBtn",
                            onclick: () => {
                                const raw = $("api-keys-input").value;
                                const keys = raw.split(',').map(k => k.trim()).filter(Boolean);
                                localStorage.setItem("AWTSMOOS_GEMINI_KEYS", JSON.stringify(keys));
                                $("apiKeyModal").classList.add("hidden");
                                awtsmoosNotice(`B"H - ${keys.length} keys integrated.`);
                            }
                        }
                    ]
                }
            ]
        }
    ]
}
