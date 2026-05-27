
/**
 * B"H
 * Core Worker Handlers
 * Includes basic system calls, mouse locking, and canvas transfer.
 */
export default function coreHandlers(manager) {
    const { eved, myUi } = manager;

    return {
        async awtsmoosEval(code) {
            if(typeof(code) == "string") {
                var result = eval(code);
                return {
                    tawchlees: {
                        message: "Got result of code",
                        code: "SUCCESS",
                        codeResult: result + ""
                    }
                };
            }
        },

        lockMouse(doIt) {
            if (doIt) {
                document.body.requestPointerLock();
            } else {
                document.exitPointerLock();
            }
        },

        async takeInCanvas(data) {
            // Safety check to prevent crash on undefined
            const { canvas, devicePixelRatio } = data || {}; 
            
            if(manager.olam && canvas) {
                manager.olam.takeInCanvas(canvas, devicePixelRatio);
                await manager.olam.heesHawvoos();
            }
        },

        async pawsawch() {
            manager.opened = true;
            await Promise.all(manager.functionsToDo.map(q => q(manager)));
            manager.functionsToDo = [];
        },

        async heescheel(options) {
            myUi.setHtml(manager.canvasElement, { style: {} });
            var off = manager.canvasElement.transferControlToOffscreen();
            eved.postMessage({
                takeInCanvas: {
                    canvas: off,
                    devicePixelRatio: window.devicePixelRatio
                }
            }, [off]);
        },

        deleteCanvas() {
            if(manager.canvasElement && manager.canvasElement.parentNode) {
                manager.canvasElement.parentNode.removeChild(manager.canvasElement);
            }
        },
        
        async getBitmap(data) {
             // Just pass through if needed, or handle if logic exists
             if(data && data.transfer) {
                 // Handle bitmap if needed
             }
        },
        
        alert(ms) { window.alert(ms + ""); },
        
        error(er) {
            myUi.htmlAction({
                shaym: "awtsmoos error",
                methods: { classList: { remove: "hidden" } },
                properties: { textContent: JSON.stringify(er) }
            });
        },
        
        getWindowSize(id) {
            const size = { width: innerWidth, height: innerHeight };
            eved.postMessage({ sized: { size, id } });
        }
    };
}
