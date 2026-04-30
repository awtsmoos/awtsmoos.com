
/**
 * B"H
 * Mobile Console - Intuitive Interactions
 */

export default[
    {
        id:"joystick-container",
        style: { pointerEvents: "auto !important", zIndex: "12000" }, 
        children:[
            {
                id: "joystick-base",
                style: { pointerEvents: "auto" },
                child: { id: "joystick-thumb", style: { pointerEvents: "none" } } 
            }
        ]
    },
    {
        id: "game-controller",
        style: { pointerEvents: "auto !important", zIndex: "12000" },
        children:[
            { id: "button-B", className: "controller-button b", textContent: "🌋", key: "KeyB" }, 
            { id: "button-Y", className: "controller-button y", textContent: "🌌", key: "KeyY" }, 
            { id: "button-E", className: "controller-button e", textContent: "🎒", key: "KeyE" }, 
            { id: "button-T", className: "controller-button t", textContent: "🔭", key: "KeyT" }, 
            { id: "button-Space", className: "controller-button s", textContent: "🦅", key: "Space" }
        ],
        ready(m, $f) {
            const ik = $f("ikar");
            if(!ik) return;
            
            Array.from(m.children).forEach(w => {
                
                // B"H: The Decree of Holding Down!
                // We send 'keydown' so the engine registers continuous action.
                const downHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    w.classList.add("active-state");
                    ik.dispatchEvent(new CustomEvent("olamPeula", {
                        detail: { keydown: { code: w.key } }
                    }));
                };
                
                const upHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    w.classList.remove("active-state");
                    ik.dispatchEvent(new CustomEvent("olamPeula", {
                        detail: { keyup: { code: w.key } }
                    }));
                };

                w.addEventListener('touchstart', downHandler, { passive: false });
                w.addEventListener('mousedown', downHandler);
                
                w.addEventListener('touchend', upHandler, { passive: false });
                w.addEventListener('mouseup', upHandler);
                w.addEventListener('mouseleave', upHandler);
                w.addEventListener('touchcancel', upHandler, { passive: false });
            })
        }
    },
    {
        tag: "style",
        innerHTML:/*css*/`
                #joystick-container {
                    position: fixed;
                    bottom: 45px;
                    left: 45px; 
                    width: 150px; height: 150px;
                    pointer-events: auto !important;
                }
        
                #joystick-base {
                    width: 100%; height: 100%;
                    background: rgba(0, 0, 30, 0.5);
                    backdrop-filter: blur(12px);
                    border: 4px solid rgba(0, 255, 237, 0.4);
                    border-radius: 50%;
                    position: relative;
                }
        
                #joystick-thumb {
                    width: 65px; height: 60px;
                    background: radial-gradient(circle, #fff 0%, #00f3ff 100%);
                    box-shadow: 0 0 30px rgba(0, 243, 255, 0.8);
                    border-radius: 50%;
                    position: absolute;
                    top: calc(50% - 30px); left: calc(50% - 32px);
                }

                #game-controller {
                    position: fixed;
                    bottom: 45px;
                    right: 45px; 
                    width: 180px; height: 180px;
                    pointer-events: auto !important;
                }
                
                .controller-button {
                    position: absolute;
                    width: 60px; height: 60px;
                    background: rgba(13, 4, 52, 0.8);
                    backdrop-filter: blur(10px);
                    border: 3px solid rgba(255, 215, 0, 0.5);
                    border-radius: 50%;
                    display: flex; justify-content: center; align-items: center;
                    color: white; font-size: 32px;
                    user-select: none; touch-action: none; /* Block native gestures on the button */
                    transition: all 0.15s;
                    box-shadow: 0 8px 15px rgba(0,0,0,0.7);
                    pointer-events: auto !important;
                    cursor: pointer;
                }

                /* Manual active state class added by JS to ensure consistency across touch and mouse */
                .controller-button.active-state {
                    transform: scale(0.85);
                    background: #ffd700;
                    box-shadow: 0 0 35px #ffd700;
                    border-color: #fff;
                }
                
                #button-T { top: 0; left: 50%; transform: translateX(-50%); } 
                #button-Space { bottom: 0; left: 50%; transform: translateX(-50%); } 
                #button-Y { top: 50%; right: 0; transform: translateY(-50%); } 
                #button-B { top: 50%; left: 0; transform: translateY(-50%); } 
                #button-E { top: 50%; left: 50%; transform: translate(-50%, -50%); width: 75px; height: 75px; border-color: #00ffed; font-size: 42px; border-width: 4px; } 

                @media (max-width: 768px) {
                    #joystick-container { left: 25px; bottom: 35px; width: 120px; height: 120px; }
                    #game-controller { right: 25px; bottom: 35px; width: 140px; height: 140px; }
                    .controller-button { width: 50px; height: 50px; font-size: 24px; }
                    #button-E { width: 60px; height: 60px; font-size: 32px; }
                }
        `
    }
]
