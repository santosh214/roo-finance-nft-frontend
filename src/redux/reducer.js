const initialState = {
  id: "",
  name: "",
  role: "",
  walletAddress: "",
  wallet: null,
  collections:[]
};
const reducer = (state = initialState, action) => {

  switch (action.type) {
    case "SAVE_WALLET":
      return {
        ...state,
        id: action.payload._id,
        name: action.payload.name,
        walletAddress: action.payload.walletAddress,
        role: action.payload.role,
        wallet: action.payload.wallet,
      };
      case "SAVE_COLLECTION":
      return {
        ...state,

        collections:action.payload.collections,
      };
    default:
      return state;
  }
  
};

export default reducer;
