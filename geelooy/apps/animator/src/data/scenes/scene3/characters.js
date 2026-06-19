// B"H

const shared = {
  archetype: 'human', view: 'threeQuarter', motionMode: 'settled',
  lineStyle: 'softCartoon', locomotion: 'idle', gesture: 'none'
};

export const SCENE3_CHARACTERS = {
  guide: {
    ...shared, id: 'guide', name: 'Guide', position: { x: -210, y: 245, scale: 0.72 },
    emotion: 'focused', speechStyle: 'clear', bodyProfile: 'expressiveLeader',
    colors: { jacket: '#2f7ed8', jacketDark: '#123b72', jacketLight: '#80baff', pants: '#182542', skin: '#d99a72', hair: '#17100d', hairDark: '#080404' }
  },
  builder: {
    ...shared, id: 'builder', name: 'Builder', position: { x: 0, y: 245, scale: 0.72 },
    emotion: 'happy', speechStyle: 'excited', bodyProfile: 'friendlyAverage',
    colors: { jacket: '#e44978', jacketDark: '#7d2244', jacketLight: '#ff9bb9', pants: '#1b1d28', skin: '#efad82', hair: '#4b2c1b', hairDark: '#1d0f09' }
  },
  watcher: {
    ...shared, id: 'watcher', name: 'Watcher', position: { x: 210, y: 245, scale: 0.68 },
    emotion: 'attentive', speechStyle: 'soft', bodyProfile: 'alertCompact', flipX: true,
    colors: { jacket: '#2f9a66', jacketDark: '#155238', jacketLight: '#86e3ad', pants: '#1b2b24', skin: '#bd7a59', hair: '#5a351e', hairDark: '#20120b' }
  }
};
