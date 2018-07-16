import { combineReducers } from 'redux';

import user from './domain/user';
import match from './domain/match';

export default combineReducers({
  user,
  match,
});
