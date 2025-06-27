//B"H

import ModalBuilder from "/scripts/awtsmoos/modalBuilder.js"
function start() {
    var btn = document.querySelector(".BH .plus.icon.btn");
    if(!btn) return null;
    btn.addEventListener("click", async () => {
         makeHeichel();
    });
}

function makeHeichel() {
    const heichelFormFields = [
    {
        type: 'text',
        name: 'heichelName',
        label: 'Heichel Name',
        id: 'heichel-name-input', // Unique ID for this field
        placeholder: 'Enter a unique name for your Heichel',
        validation: (value) => value.trim().length >= 3,
        errorMessage: 'Heichel Name must be at least 3 characters long.'
    },
    {
        type: 'textarea',
        name: 'heichelDescription',
        label: 'Heichel Description',
        id: 'heichel-description-input',
        placeholder: 'Describe your Heichel in detail...',
        validation: (value) => value.trim().length > 10,
        errorMessage: 'A description of at least 10 characters is required.'
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
];

// Create a new modal instance for the Heichel Creation
const heichelCreationModal = new ModalBuilder({
    id: 'heichel-creation-modal', // UNIQUE ID - Crucial for CSS scoping!
    title: 'Forge a New Heichel',
    fields: heichelFormFields,
    submitButtonText: 'Manifest Heichel',
    showCloseButton: true,
    onSubmit: async (data) => {
        console.log('Attempting to manifest Heichel:', data);
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

    heichelCreationModal.open()
}

export default {
    start
}