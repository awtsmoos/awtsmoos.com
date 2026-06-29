// B"H
export const labels = Object.freeze({
  forYou: 'For You',
  following: 'Following',
  trending: 'Trending',
  civilization: 'Civilization',
  search: 'Search'
});

export const state = {
  mode: 'forYou',
  lastQuery: '',
  selectedKey: '',
  objects: new Map()
};

/** B"H: one state cup, many live reflections. */
