// B"H
(function ectExtremeHook(root) {
  const ect = root.AwtsECT = root.AwtsECT || {};

  /**
   * B"H. The old byte-token packer is left behind like a husk. From this point
   * the UI calls the dynamic bit-semantic packer: HTML/CSS/JS meaning first,
   * adaptive bit fields second, literal bytes only for real user literals.
   */
  if (typeof ect.packProjectExtreme === "function") {
    ect.packProject = ect.packProjectExtreme;
  }
})(window);
