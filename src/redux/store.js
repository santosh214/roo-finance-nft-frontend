import { applyMiddleware, compose, createStore, combineReducers } from "redux";
// import thunk from "redux-thunk";
import reducer from "./reducer";
const rootReducer = combineReducers({
  state: reducer,
});

// const middleware = [thunk];
// const composeEnhancers = compose(applyMiddleware(...middleware));

const configureStore = () => {
  return createStore(rootReducer);
};
const store = configureStore();

export default store;
