// B"H
/** Chapter 307: Buttons reveal their names even when CSS is absent. */
export function blessControlLabels() {
  const labels = [['typographyBtn', 'Typography'], ['commentaryBtn', 'Notes']];
  labels.forEach(([id, label]) => {
    const button = document.getElementById(id);
    if (button && !button.getAttribute('data-awtsmoos-label')) button.setAttribute('data-awtsmoos-label', label);
  });
}
