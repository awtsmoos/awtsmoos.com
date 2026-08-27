// B"H
import * as persistence from '../../persistence.js';
import { toggleModal, showErrorModal } from '../../ui.js';
import { PROVIDERS, generateLevel, fetchModels } from '../../ai/ai-manager.js';

export class AiGenerator {
    constructor(elements, onGenerate) {
        this.elements = elements.ai;
        this.onGenerate = onGenerate;
        this.currentProviderId = 'gemini';
    }

    async showAiModal(providerId) {
        this.currentProviderId = providerId;
        const provider = PROVIDERS[providerId];
        
        this.elements.modalTitle.textContent = `Generate with ${provider.name}`;
        this.elements.apiKeyLabel.textContent = `${provider.name} API Key`;
        this.elements.apiKeyLink.href = provider.keyUrl;
        
        this.elements.status.textContent = '';
        await this.updateUiForKeyState();
        toggleModal(true, 'ai-modal');
    }

    async updateUiForKeyState(shouldFetchModels = false) {
        const apiKey = await persistence.getApiKeyForProvider(this.currentProviderId);
        if (apiKey) {
            this.elements.keyEntryView.style.display = 'none';
            this.elements.generateView.style.display = 'flex';
            if(shouldFetchModels) {
                await this.fetchAndPopulateModels(apiKey);
            }
        } else {
            this.elements.keyEntryView.style.display = 'block';
            this.elements.generateView.style.display = 'none';
        }
    }

    async saveKeyAndFetchModels() {
        const apiKey = this.elements.apiKeyInput.value.trim();
        if (apiKey) {
            await persistence.setApiKeyForProvider(this.currentProviderId, apiKey);
            await this.updateUiForKeyState(true);
        }
    }
    
    async forgetKey() {
        await persistence.setApiKeyForProvider(this.currentProviderId, '');
        this.elements.apiKeyInput.value = '';
        await this.updateUiForKeyState();
    }

    async fetchAndPopulateModels(apiKey) {
        const select = this.elements.modelSelect;
        select.innerHTML = '';
        this.elements.modelLoader.style.display = 'block';
        this.elements.status.textContent = `Fetching available ${PROVIDERS[this.currentProviderId].name} models...`;
        
        try {
            const models = await fetchModels(this.currentProviderId, apiKey);
            const savedModel = await persistence.getAiModelForProvider(this.currentProviderId);
            
            let foundSavedModel = false;
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.name;
                if (model.id === savedModel) {
                    option.selected = true;
                    foundSavedModel = true;
                }
                select.appendChild(option);
            });

            if (!foundSavedModel && models.length > 0) {
                select.selectedIndex = 0;
                await persistence.setAiModelForProvider(this.currentProviderId, models[0].id);
            }
            
            this.elements.status.textContent = '';
        } catch (error) {
            const isApiKeyError = error.statusCode === 404 || error.statusCode === 401 || error.statusCode === 403;
            const specificMessage = isApiKeyError ? 
                `This error often means the API key is invalid, restricted, or has insufficient credits. Please check your key's settings on the ${PROVIDERS[this.currentProviderId].name} dashboard.`
                : 'An unexpected error occurred.';

            showErrorModal(
                `Error Fetching Models`, 
                `${error.message}\n\n${specificMessage}`, 
                error.details || 'No further details available.',
                isApiKeyError
            );
            await this.forgetKey(); 
        } finally {
            this.elements.modelLoader.style.display = 'none';
        }
    }

    async handleGenerate() {
        const apiKey = await persistence.getApiKeyForProvider(this.currentProviderId);
        const model = this.elements.modelSelect.value;
        const prompt = this.elements.promptInput.value.trim();
        const generateButton = this.elements.modalGenerate;

        if (!apiKey || !prompt || !model) {
            this.elements.status.textContent = 'API Key, Model, and Prompt are required.';
            return;
        }
        
        this.elements.status.textContent = `Asking ${PROVIDERS[this.currentProviderId].name} to generate a level...`;
        generateButton.disabled = true;

        try {
            const levelData = await generateLevel(this.currentProviderId, prompt, apiKey, model);
            if (levelData) {
                this.onGenerate(levelData);
                toggleModal(false, 'ai-modal');
            } else {
                this.elements.status.textContent = 'AI failed to generate a valid level. Please try again.';
            }
        } catch (error) {
            const isApiKeyError = error.statusCode === 404 || error.statusCode === 403 || error.statusCode === 400 || error.statusCode === 401;
            const message = `${error.message}. Please check your prompt and ensure your API key has the correct permissions.`;
            showErrorModal('Error Generating Level', message, error.details || 'No further details available.', isApiKeyError);
        } finally {
            generateButton.disabled = false;
        }
    }
}