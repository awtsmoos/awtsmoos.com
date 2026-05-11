
// B"H
/**
 * @file InjectedOrchestrator.js
 * @brief The Digital Golem within the Sandbox.
 * 
 * CHAPTER IV: THE HANDS THAT MOVE IN SILENCE
 * 
 * "And He breathed into his nostrils the breath of life."
 * This script is injected into the <head> of the test environment.
 * It lies dormant until it hears the 'START_TEST_PLAN' command.
 * Upon hearing it, it animates. It dispatches synthetic MouseEvents to click buttons.
 * It alters input values and fires 'input' events to simulate typing.
 * It waits patiently using MutationObservers. 
 * Finally, it evaluates expressions and reports the complete state back to the higher dimension.
 */

export const InjectedOrchestrator = {
    getScript(uniqueTestId) {
        return `
        (function() {
            const TEST_ID = "${uniqueTestId}";
            
            // Wait for the master to give us the breath of action
            window.addEventListener('message', async (e) => {
                if (e.data && e.data.type === 'START_TEST_PLAN' && e.data.testId === TEST_ID) {
                    console.log('B"H [Homunculus] Test Plan Received. Initiating Execution.');
                    const plan = e.data.plan || [];
                    const report = [];

                    for (const step of plan) {
                        let result = null;
                        let success = true;
                        let errorStr = null;

                        try {
                            switch (step.action) {
                                case 'click': {
                                    const el = document.querySelector(step.selector);
                                    if (!el) throw new Error(\`Element not found: \${step.selector}\`);
                                    
                                    // B"H - Real physical click simulation
                                    const rect = el.getBoundingClientRect();
                                    const clickEvent = new MouseEvent('click', {
                                        view: window, bubbles: true, cancelable: true,
                                        clientX: rect.left + rect.width / 2,
                                        clientY: rect.top + rect.height / 2
                                    });
                                    el.dispatchEvent(clickEvent);
                                    break;
                                }

                                case 'type': {
                                    const el = document.querySelector(step.selector);
                                    if (!el) throw new Error(\`Element not found: \${step.selector}\`);
                                    el.value = step.text;
                                    el.dispatchEvent(new Event('input', { bubbles: true }));
                                    el.dispatchEvent(new Event('change', { bubbles: true }));
                                    break;
                                }

                                case 'wait': {
                                    await new Promise(r => setTimeout(r, step.ms || 1000));
                                    break;
                                }

                                case 'wait_for_element': {
                                    const timeout = step.timeout || 5000;
                                    const start = Date.now();
                                    while (!document.querySelector(step.selector)) {
                                        if (Date.now() - start > timeout) throw new Error(\`Timeout waiting for \${step.selector}\`);
                                        await new Promise(r => setTimeout(r, 100));
                                    }
                                    break;
                                }

                                case 'evaluate': {
                                    // B"H - Extracting the inner mind of the app
                                    const val = eval(step.expression);
                                    
                                    // Ensure it's serializable
                                    try {
                                        JSON.stringify(val);
                                        result = val;
                                    } catch(err) {
                                        result = String(val);
                                    }
                                    break;
                                }

                                case 'read_dom': {
                                    const el = document.querySelector(step.selector || 'body');
                                    if (!el) throw new Error(\`Element not found: \${step.selector}\`);
                                    result = el.innerHTML.substring(0, 1000); // Cap size to prevent payload crush
                                    break;
                                }

                                default:
                                    throw new Error(\`Unknown action: \${step.action}\`);
                            }
                        } catch (err) {
                            success = false;
                            errorStr = err.message;
                        }

                        report.push({
                            action: step.action,
                            selector: step.selector,
                            success,
                            error: errorStr,
                            result
                        });

                        // Stop execution if a critical physical action fails
                        if (!success && step.action !== 'read_dom' && step.action !== 'evaluate') {
                            break; 
                        }
                    }

                    // Extract the final shape of the body for the Oracle to observe
                    const finalDOM = document.body ? document.body.innerHTML.substring(0, 2000) : "No body found.";

                    // Return the Truth to the higher realm
                    window.parent.postMessage({
                        type: 'TEST_COMPLETED',
                        testId: TEST_ID,
                        report: report,
                        finalDOM: finalDOM
                    }, '*');
                }
            });
        })();
        `;
    }
};
