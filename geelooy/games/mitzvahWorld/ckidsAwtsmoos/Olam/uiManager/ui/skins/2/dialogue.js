/**B"H
 * CSS for dialogue boxes
 */

import borderShadow from "../../resources/borderShadow.js";

var approachTranslate = `translateX(0);`
var DIALOGUE_BORDER = 2;
var APPROACH_BORDER = 5;
export default /*css*/`
    :root {
        --shadowWidth: 1.6px;
    }

    .dialogue > div:hover {
        cursor: pointer;
        background: rgb(36 21 80 / 25%);
        box-shadow: 3px 3px 0px rgb(243 214 133 / 80%) inset, -3px -3px 0px rgb(241 219 155 / 80%) inset, 0 0 0 2px #ffe8a4;
    }

    .dialogue {
        display: flex;
        max-width: 600px;
        flex-direction: column;
        z-index:100;
        justify-content: center;
        align-items: left;
       
        border-radius: 12px;
        background: rgba(36, 21, 80, 0.50);
        backdrop-filter: blur(4px);

        /*styles for the
        text of each dialogue*/

        
        color: #FFF;
       
        font-family: Fredoka One;
        font-size: 1.6em;
        max-width: 30%;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        letter-spacing: 0.72px;

        opacity: 0;
        visibility: hidden;
        transition: opacity 0.5s, visibility 0.5s;


        text-shadow: -${
            DIALOGUE_BORDER
        }px -${
            DIALOGUE_BORDER
        }px 0 #000, ${
            DIALOGUE_BORDER
        }px -${
            DIALOGUE_BORDER
        }px 0 #000, -${
            DIALOGUE_BORDER
        }px ${
            DIALOGUE_BORDER
        }px 0 #000, ${
            DIALOGUE_BORDER
        }px ${
            DIALOGUE_BORDER
        }px 0 #000;
            

    }

    .dialogue.npc {
        padding: 16px 12px;
    }

    .dialogue.chossid > div{
        padding: 16px 12px;

    }
    /*For a selected piece
    of text within a dialogue
    box*/
    .selected {
       
        box-shadow: 3px 3px 0px rgba(
            254, 203, 57, 0.80
        ) inset, 
        -3px -3px 0px rgba(
            254, 203, 57, 0.80
        ) inset, 
        0 0 0 2px #FECB39;
        text-shadow: ${
            borderShadow(DIALOGUE_BORDER)
        },
        0px 0px 6px rgba(254, 203, 57, 0.80);
       
    }

    .selected:first-child {
        border-radius: 12px 12px 0px 0px;
    }

    .selected:last-child {
        border-radius: 0px 0px 12px 12px;
    }



    /*
        box that happens when u 
        appraoch it
    */

        .asApproachNpc {
            animation: pulse 2s infinite;
            background-color: #FFE4C4;
            color: #6B4226;
            top: 50px;
            max-width: 50%;
            left: 10px;
            border: 2px solid #DAA520;
            border-radius: 12px;
            padding: 22px;
            font-family: 'IM Fell English SC', serif;
            letter-spacing: 1px;
            font-size: 1.3em;
            line-height: 1.5;
            text-shadow: calc(-1* 5) calc(-1* 5) 0 #000, 5 calc(-1* 5) 0 #000, calc(-1* 5) 5 0 #000, 5 5 0 #000;
            z-index: 1000;
            transform-origin: left;
        }

   
      @keyframes pulse {
        0% {
          transform: scale(1) ${approachTranslate};
        }
        50% {
          transform: scale(1.1) ${approachTranslate};
        }
        100% {
          transform: scale(1) ${approachTranslate};
        }
      }
`;