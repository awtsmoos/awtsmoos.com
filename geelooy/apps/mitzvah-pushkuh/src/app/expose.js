// B"H
// A small window for tests: proof without tearing open the garden.
export function exposeGarden(api) {
  window.mitzvahPushkuh = {
    version: api.version,
    getEntries: api.getEntries,
    seedGameWorld: api.seedGameWorld,
    plantTestSpark: api.plantTestSpark,
    tendFirstSpark: api.tendFirstSpark,
    visualFeedbackTest: api.visualFeedbackTest
  };
}
