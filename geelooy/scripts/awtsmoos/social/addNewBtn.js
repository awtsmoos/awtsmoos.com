//B"H

import ModalBuilder from "/scripts/awtsmoos/modalBuilder.js"
import ExtremeDropdown from "/scripts/awtsmoos/ExtremeDropdown.js"


function start() {
    var btn = document.querySelector(".forge.icon");
    if(!btn) return null;

    
    var drop = new ExtremeDropdown({
        parentElement: btn,
        options: [
            { text: 'Create new Heichel (space)', onclick() {
                makeHeichel()
               // drop.hide()
            } },
            {
                text: "Create new Post"
            }
           
            
        ],
        // Optional configurations:
        // dropdownClass: 'my-custom-dropdown',
        // triggerClass: 'my-custom-trigger',
        // closeOnClickOutside: false,
        // animationDuration: '0.5s',
        // animationTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' // Insane custom easing
    })
    window.drop=drop;
    btn.addEventListener("click", async () => {
     //    makeHeichel();
         
        if(!drop.isVisible()) {
            
            drop.hide();
           
        } else if(drop.isVisible()){
            drop.show();
        }
    });
}
var openModales = {}

function makeHeichel() {
  /*var mod = document.querySelector("#heichel-creation-modal");
    if(mod) {
        mod.classList
    }
    */

    var heichel = openModales.makeHeichel;
    if(heichel) {
        heichel.open()
        return;
    }
// Create a new modal instance for the Heichel Creation
const heichelCreationModal = new ModalBuilder({
    id: 'heichel-creation-modal', // UNIQUE ID - Crucial for CSS scoping!
    title: 'Forge a New Heichel',
    fields: [
        {
            type: 'text',
            name: 'heichelName',
            label: 'Heichel Name',
            id: 'heichel-name-input', // Unique ID for this field
            placeholder: 'Enter a unique name for your Heichel',
            validation: (value) => value.trim().length >= 3,
            errorMessage: 'Heichel Name must be at least 3 characters long.',
            async oninput(e, fd) {
                //B"H
                var f = await (await fetch(`/api/social/heichelActions/generateHeichelId`, {
                    method: "POST",
                    body: new URLSearchParams({
                        heichelName: e.target.value
                    })
                })).json();
                var heichelId = f?.heichelId;
                if(heichelId) {
                    fd["heichel-id-input"].value =heichelId
                }
            }
        },
        {
            type: 'textarea',
            name: 'heichelDescription',
            label: 'Heichel Description',
            id: 'heichel-description-input',
            placeholder: 'Describe your Heichel in detail...',
         
            
        },
        {
            type: 'text',
            name: 'heichelId',
            label: 'Heichel Unique ID',
            id: 'heichel-id-input',
            placeholder: 'e.g., PRIME_001',
            validation: (value) => /^[a-zA-Z0-9_.-]+$/.test(value),
            errorMessage: 'ID can only contain letters, numbers, underscores, dots, and hyphens.'
            
        },
        {
            type: 'checkbox',
            name: 'activateHeichel',
            label: 'Activate Heichel upon creation',
            id: 'activate-heichel-checkbox',
            checked: true
        }
    ],
    submitButtonText: 'Manifest Heichel',
    showCloseButton: true,
    onSubmit: async (data) => {
        // Simulate an API call or processing
        await new Promise(resolve => setTimeout(resolve, 1800));

        if (data.heichelName.toLowerCase() === 'genesis') {
            return {
                success: false,
                message: 'The name "Genesis" is reserved for foundational entities. Choose another.',
                closeModal: false
            };
        }

        return {
            success: true,
            message: `Heichel "${data.heichelName}" (ID: ${data.heichelId}) has been successfully manifested into existence!`,
            closeModal: true
        };
    },
    successMessage: 'Your new Heichel creation is complete. Proceed with caution.',
    errorMessage: 'Manifestation failed. Cosmic energies are unstable. Please try again.'
});
    openModales.makeHeichel = heichelCreationModal
    heichelCreationModal.open()
}

export default {
    start
}
