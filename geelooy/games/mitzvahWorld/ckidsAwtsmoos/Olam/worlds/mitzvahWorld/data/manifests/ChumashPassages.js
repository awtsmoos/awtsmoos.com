/**
 * B"H
 * Chapter 5: The Chumash Opens Like A Gate Of Fire.
 *
 * The Awtsmoos breathes through verses. Each passage is inventory-readable,
 * action-bar-ready, and debate-usable: pshat earth/Asiyah, remez water/
 * Yetzirah, derush fire/Beriah, sod air/Atzilus.
 */

export const CHUMASH_PASSAGES = Object.freeze({
  bereishis_1_1: Object.freeze({
    id: 'bereishis_1_1',
    book: 'Chumash',
    ref: 'Bereishis 1:1',
    verse: 'In the beginning G-d created the heavens and the earth.',
    pirushim: Object.freeze({
      pshat: { world: 'Asiyah', element: 'earth', concept: 'Creation has a beginning.' },
      remez: { world: 'Yetzirah', element: 'water', concept: 'Heaven and earth hint to hidden unity.' },
      derush: { world: 'Beriah', element: 'fire', concept: 'Creation demands purposeful action.' },
      sod: { world: 'Atzilus', element: 'air', concept: 'All being is renewed from Divine speech.' }
    })
  }),
  shemos_20_2: Object.freeze({
    id: 'shemos_20_2',
    book: 'Chumash',
    ref: 'Shemos 20:2',
    verse: 'I am Hashem your G-d Who took you out of Egypt.',
    pirushim: Object.freeze({
      pshat: { world: 'Asiyah', element: 'earth', concept: 'The Exodus happened in lived history.' },
      remez: { world: 'Yetzirah', element: 'water', concept: 'Every limit can be crossed through faith.' },
      derush: { world: 'Beriah', element: 'fire', concept: 'Freedom obligates service.' },
      sod: { world: 'Atzilus', element: 'air', concept: 'The Essence reveals itself within command.' }
    })
  })
});

export const STARTING_CHUMASH_ITEM = Object.freeze({
  id: 'book_chumash_bereishis',
  className: 'Chumash',
  name: 'Chumash: Opening Light',
  description: 'A readable Chumash with passages for Torah debate.',
  icon: '📘',
  readable: true,
  actionBarReady: true,
  passageIds: ['bereishis_1_1', 'shemos_20_2']
});
