/**
 * B"H
 */

/* Variables for dynamic sizing and positioning */
var controllerSize = 300; // Size of the game controller
var buttonSize = 100; // Size of each button
var margin = 10; // Margin around each button
var totalSize = buttonSize + margin * 2; // Total size including margin
var offset = (controllerSize - totalSize) / 2; // Offset to center the buttons

export default [
    {
        id:"joystick-container",
        children: [
            {
                id: "joystick-base",
                child: {
                    id: "joystick-thumb"
                }
            }
            
        ]
    },
    {
        id: "game-controller",
        children: [
            { id: "button-B", 
                className: "controller-button", 
                textContent: "B",
                key: "KeyB"
            },
            { id: "button-T", 
                className: "controller-button",
                 textContent: "Y" },
            { 
                id: "button-Enter", 
                className: "controller-button", 
                textContent: "E",
                key: "Enter"
            },
            { id: "button-Y", 
             className: "controller-button", 
             textContent: "T" },
            { 
                id: "button-Space", 
                className: "controller-button", 
                textContent: "S",
                key: "Space" 
            }
        ],
        ready(m, $f) {
            var ik = $f("ikar");
            if(!ik) {
                console.log("NO",m)
                return;
            }
            
            Array.from(m.children).forEach(w => {
                var func = () => {
                    console.log("Clackled", w,w.key)
                    ik.dispatchEvent(
                        new CustomEvent(
                            "olamPeula", {
                                detail: {
                                    presskey: {
                                        code: w.key || (
                                            "Key"+w.textContent
                                        )
                                    }
                                }
                            }
                        )
                    )
                }
               // w.onclick = func;
                w.ontouchstart = func;
            })
        }
    },
    {
        tag: "style",
        innerHTML   :/*css*/`
                #joystick-container {
                    position: fixed;
                    bottom: 15px;
                    right: 15px;
                    width: 100px;
                    height: 100px;
                }
        
                #joystick-base {
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.4); /* Semi-transparent black */
                    border-radius: 50%;
                    position: relative;
                    touch-action: none; /* Prevents the browser's default touch actions */
                }
        
                #joystick-thumb {
                    width: 50%;
                    height: 50%;
                    background-color: rgba(255, 255, 255, 0.8); /* Semi-transparent white */
                    border-radius: 50%;
                    position: absolute;
                    top: 25%;
                    left: 25%;
                }

                :root {
                    --buttonSize: 50px;
                    --controllerSize: 150px;

                    --margin: 10px;
                    --offset: 30px;
                }
                
                #game-controller {
                    position: fixed;
                    bottom: 5px;
                    left: 5px;
                    width: var(--controllerSize);
                    height: var(--controllerSize);
                    z-index:5;
                }
                
                .controller-button {
                    position: absolute;
                    width: var(--buttonSize);
                    height: var(--buttonSize);
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: white;
                    font-size: 36px;
                    user-select: none;
                    touch-action: manipulation;
                    transition: background-color 0.3s, transform 0.2s;
                }
                
                #button-Space {
                    background-color: blue;
                    bottom: 0;
                    left: 50%;
                    transform: translate(-50%, 0);
                }
                
                #button-T {
                    background-color: red;
                    top: 0;
                    left: 50%;
                    transform: translate(-50%, 0);
                }
                
                #button-Y {
                    color: black;
                    background-color: yellow;
                    top: 50%;
                    right: 0;
                    transform: translate(0, -50%);
                }
                
                #button-B {
                    background-color: green;
                    top: 50%;
                    left: 0;
                    transform: translate(0, -50%);
                }

                #button-Enter {
                    background-color: cyan;
                    bottom:0;
                    color:black;
                    left: 50%;
                    transform: translate(-50%, -100%);
                }

                
                .controller-button:active {
                    box-shadow: inset 0px 0px 20px 9px #000000;
                }
                
                
        
        `
    }
]
