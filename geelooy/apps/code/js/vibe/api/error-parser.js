
// B"H
/**
 * @file error-parser.js
 * @brief Translates dimensional divergence into actionable human advice.
 */

export const VibeErrorParser = {
    async parse(err) {
        let msg = "An unknown divergence has manifest.";
        let code = "UNKNOWN";
        let title = "System Shattering";
        let actionAdvice = "Consult the system logs.";
        let linkUrl = null;
        let rawData = null;

        try {
            if (err instanceof Response) {
                code = String(err.status);
                const rawText = await err.text();
                try {
                    rawData = JSON.parse(rawText);
                    msg = rawData.error?.message || rawData.message || rawText;
                } catch(e) { msg = rawText || err.statusText; }
            } else if (err && typeof err === 'object') {
                rawData = err;
                msg = err.message || err.error?.message || String(err);
                code = String(err.code || err.status || "MODEL_ERROR");
            } else { msg = String(err); }
        } catch(e) { msg = String(err); }

        // B"H - Mapping Code To Advice
        if (code === "503" || msg.indexOf("high demand") !== -1) {
            title = "High Demand Surcharge (503)";
            actionAdvice = "Gemini is currently crowded. Attempt the ritual again in a few minutes, or try a lighter OpenRouter model.";
        } else if (code === "402" || msg.indexOf("credits") !== -1) {
            title = "Essence DEPLETED (402)";
            actionAdvice = "Visit OpenRouter to replenish your dimensional credits.";
            linkUrl = "https://openrouter.ai/settings/credits";
        } else if (code === "429") {
            title = "Rate Limit Breach (429)";
            actionAdvice = "Too many emanations in a single tick. Wait 30 seconds for the world to cool.";
        }

        return {
            title: title,
            message: msg,
            code: code,
            action: actionAdvice,
            link: linkUrl,
            raw: rawData
        };
    }
};
