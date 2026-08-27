// B"H
export class UndoButton {
  static render(state) {
    const canUndo = state.history.canUndo();
    return {
      tag: 'button',
      attr: {
        className: `btn btn-sm history-undo-button ${canUndo ? 'btn-primary' : 'is-disabled'}`,
        disabled: !canUndo
      },
      children: '↺ REVERT TIME (UNDO)',
      events: {
        click: () => {
          if (canUndo) state.undo();
        }
      }
    };
  }
}
