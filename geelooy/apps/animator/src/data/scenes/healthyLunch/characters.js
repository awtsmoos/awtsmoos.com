// B"H
const base = { archetype: 'human', view: 'threeQuarter', lineStyle: 'softCartoon', locomotion: 'idle' };

export const HEALTHY_LUNCH_CHARACTERS = {
  kid: {
    ...base,
    id: 'kid',
    name: 'Kid',
    position: { x: -86, y: 210, scale: 0.82, anchor: 'floor' },
    emotion: 'curious',
    acting: 'listen_idle',
    bodyProfile: 'alertCompact',
    gazeMode: 'tableAware',
    expressionProfile: 'bright_child',
    speechEnergy: 1.15,
    colors: {
      jacket: '#2f7ed8', jacketDark: '#123b72', jacketLight: '#87c0ff',
      pants: '#172845', skin: '#d99a72', hair: '#17100d', hairDark: '#080404'
    }
  },
  guide: {
    ...base,
    id: 'guide',
    name: 'Guide',
    position: { x: 96, y: 210, scale: 0.86, anchor: 'floor' },
    emotion: 'warm',
    acting: 'explain',
    bodyProfile: 'friendlyAverage',
    flipX: true,
    gazeMode: 'tableAware',
    expressionProfile: 'warm_teacher',
    speechEnergy: 1.08,
    colors: {
      jacket: '#35a36f', jacketDark: '#17603e', jacketLight: '#8de0b3',
      pants: '#1b2b24', skin: '#bd7a59', hair: '#5a351e', hairDark: '#20120b'
    }
  }
};
