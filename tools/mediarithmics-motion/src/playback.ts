export type PlaybackConditions = {
  enabled: boolean;
  visible: boolean;
  documentVisible: boolean;
  dialogOpen: boolean;
  interacting: boolean;
};

export const shouldPlay = (state: PlaybackConditions) => state.enabled && state.visible && state.documentVisible && !state.dialogOpen && !state.interacting;

export const motionAllowed = (choice: boolean | null, reduced: boolean) => choice ?? !reduced;
