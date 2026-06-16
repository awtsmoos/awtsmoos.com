/** B"H — DialogueTrees.js: every first NPC asks instead of silently existing. */
export const DIALOGUE_TREES = {
  welcome_chossid: {
    startNode: 'greeting',
    nodes: {
      greeting: { text: 'B"H! Welcome. Study or act?', options: [{ text: 'Study.', next: 'study_path' }, { text: 'Act.', next: 'action_path' }] },
      study_path: { text: 'Open a sefer and light your first Torah skill.', options: [{ text: 'Thank you.', next: null }] },
      action_path: { text: 'Help the village and watch it answer.', options: [{ text: 'On my way.', next: null }] }
    }
  },
  village_rebbe_intro: {
    startNode: 'ask',
    nodes: {
      ask: { text: 'B"H, will you gather the siddur pages and begin your shlichus?', options: [{ text: 'Yes, Rebbe.', next: 'accept' }, { text: 'What is the reward?', next: 'reward' }] },
      accept: { text: 'Find three pages nearby, then return for a blessing and your first sefer.', options: [{ text: 'I will go.', next: null }] },
      reward: { text: 'Light, learning, and the first key to building the village.', options: [{ text: 'I accept.', next: 'accept' }] }
    }
  },
  melamed_learning: {
    startNode: 'ask',
    nodes: {
      ask: { text: 'Do you want to learn Chumash and unlock the Chumash Reader skill?', options: [{ text: 'Learn now.', next: 'learn' }, { text: 'Ask about debate.', next: 'debate' }] },
      learn: { text: 'Take the Chumash. A pasuk becomes a path.', options: [{ text: 'Open sefer.', next: null }] },
      debate: { text: 'Torah debate is not fighting; it is light striking light until truth sings.', options: [{ text: 'Begin later.', next: null }] }
    }
  },
  market_shliach_shop: {
    startNode: 'ask',
    nodes: {
      ask: { text: 'Buy, sell, or inspect animal and farm goods?', options: [{ text: 'Buy clothing.', next: 'buy' }, { text: 'Sell goods.', next: 'sell' }] },
      buy: { text: 'The blue bekeshe is ready when you choose to wear it.', options: [{ text: 'Try it.', next: null }] },
      sell: { text: 'Bring wool, kosher hide, or wheat and I will trade fairly.', options: [{ text: 'I understand.', next: null }] }
    }
  },
  tailor_clothing: {
    startNode: 'ask',
    nodes: {
      ask: { text: 'Would you like to switch clothing for the holy road?', options: [{ text: 'Wear blue bekeshe.', next: 'wear' }, { text: 'Keep current clothes.', next: null }] },
      wear: { text: 'A garment is also a mission: walk differently.', options: [{ text: 'Beautiful.', next: null }] }
    }
  },
  farmer_first_crop: {
    startNode: 'ask',
    nodes: {
      ask: { text: 'Will you plant, water, or harvest wheat for the village?', options: [{ text: 'Plant.', next: 'plant' }, { text: 'Harvest.', next: 'harvest' }] },
      plant: { text: 'Seeds enter the hidden earth like a mitzvah entering time.', options: [{ text: 'Amen.', next: null }] },
      harvest: { text: 'Bring wheat to market and the community table grows.', options: [{ text: 'I will.', next: null }] }
    }
  }
};
