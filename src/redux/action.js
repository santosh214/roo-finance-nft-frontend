export const saveWallet = (payload) => {
  return {
    type: 'SAVE_WALLET',
    payload,
  };
};

export const saveCollection = (payload) => {
  return {
    type: 'SAVE_COLLECTION',
    payload,
  };
};
