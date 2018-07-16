import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import rootReducer from './modules/reducer';

const composeEnhancers = composeWithDevTools({
  pause: true, // start/pause recording of dispatched actions
  lock: true, // lock/unlock dispatching actions and side effects
  persist: true, // persist states on page reloading
  export: true, // export history of actions in a file
  import: 'custom', // import history of actions from a file
  jump: true, // jump back and forth (time travelling)
  skip: true, // skip (cancel) actions
  reorder: true, // drag and drop actions in the history list
  dispatch: true, // dispatch custom actions or action creators
  test: true, // generate tests for the selected actions
  // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
});

const enhancer = composeEnhancers(
  applyMiddleware(thunkMiddleware),
  // other store enhancers if any
);

export default function createAppStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    enhancer,
  );
}
