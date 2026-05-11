
// B"H
/**
 * @file InjectedHomunculus.js
 * @brief The Eyes and Hands within the Testing Iframe.
 */

export const InjectedHomunculus = {
    getScript(uniqueTestId) {
        return ' (function() {\n' +
            '    const TEST_ID = "' + uniqueTestId + '";\n' +
            '    const testLogs = [];\n\n' +
            '    // B"H - Intercept Physical Entry Rejections (404/Imports)\n' +
            '    window.addEventListener("error", function(e) {\n' +
            '       if (e.target && (e.target.tagName === "SCRIPT" || e.target.tagName === "LINK")) {\n' +
            '           testLogs.push("[ASSET_FAILURE] Failed to load: " + (e.target.src || e.target.href));\n' +
            '       } else {\n' +
            '           testLogs.push("[JS_ERROR] " + e.message + " at " + e.filename + ":" + e.lineno);\n' +
            '       }\n' +
            '    }, true);\n\n' +
            '    window.addEventListener("unhandledrejection", function(e) {\n' +
            '       testLogs.push("[PROMISE_REJECTION] " + (e.reason?.message || e.reason || "Void reason"));\n' +
            '    });\n\n' +
            '    window.addEventListener("message", async function(e) {\n' +
            '        if (e.data && e.data.type === "START_TEST_PLAN" && e.data.testId === TEST_ID) {\n' +
            '            const plan = e.data.plan || [];\n' +
            '            const report = [];\n' +
            '            for (const step of plan) {\n' +
            '                let success = true; let error = null; let result = null;\n' +
            '                try {\n' +
            '                    switch(step.action) {\n' +
            '                        case "click": document.querySelector(step.selector).click(); break;\n' +
            '                        case "type": \n' +
            '                            const el = document.querySelector(step.selector);\n' +
            '                            el.value = step.text; \n' +
            '                            el.dispatchEvent(new Event("input", {bubbles:true})); \n' +
            '                            break;\n' +
            '                        case "wait": await new Promise(r => setTimeout(r, step.ms || 1000)); break;\n' +
            '                        case "evaluate": \n' +
            '                            const val = eval(step.expression);\n' +
            '                            result = (typeof val === "object") ? JSON.stringify(val) : String(val);\n' +
            '                            break;\n' +
            '                    }\n' +
            '                } catch(err) { success = false; error = err.message; }\n' +
            '                report.push({ action: step.action, success, error, result });\n' +
            '                if (!success) break;\n' +
            '            }\n' +
            '            const finalDOM = document.body ? document.body.innerHTML.substring(0, 1000) : "Void";\n' +
            '            window.parent.postMessage({ \n' +
            '                type: "TEST_COMPLETED", \n' +
            '                testId: TEST_ID, \n' +
            '                report: report, \n' +
            '                finalDOM: finalDOM, \n' +
            '                interceptedLogs: testLogs \n' +
            '            }, "*");\n' +
            '        }\n' +
            '    });\n' +
            '})(); ';
    }
};
