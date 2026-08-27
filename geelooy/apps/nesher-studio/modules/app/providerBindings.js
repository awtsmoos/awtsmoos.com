/* B"H
Provider bindings: names of platforms pass through a small gate.
The stream may point outward, yet every packet begins as present creation.
*/
import { STREAM_PROVIDERS, formatSummary, getProvider } from '../providers/streamProviders.js';

export function setupProviders({ dom, state, setProviderUi }) {
  dom.streamProvider.innerHTML = STREAM_PROVIDERS.map(providerOption).join('');
  dom.streamProvider.value = state.providerId;
  updateProviderUi({ state, setProviderUi });
}

export function bindProviderControls({ dom, state, setProviderUi }) {
  dom.streamProvider.onchange = () => {
    state.providerId = dom.streamProvider.value;
    updateProviderUi({ state, setProviderUi });
  };
}

function updateProviderUi({ state, setProviderUi }) {
  setProviderUi(getProvider(state.providerId), formatSummary());
}

function providerOption(provider) {
  return `<option value="${provider.id}">${provider.name}</option>`;
}
