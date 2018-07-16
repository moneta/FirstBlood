import fetchData from '../../../common/utils/fetchData';

const REQUEST_LOGIN = 'login/REQUEST_LOGIN';
const RECEIVE_LOGIN = 'login/RECEIVE_LOGIN';
const BAD_REQUEST = 'login/BAD_REQUEST';

export const ActionTypes = {
  REQUEST_LOGIN,
  RECEIVE_LOGIN,
  BAD_REQUEST,
};

const initialState = {};

export default function user(state = initialState, action = {}) {
  switch (action.type) {
    case RECEIVE_LOGIN:
      return {
        ...action.data,
      };
    default:
      return state;
  }
}

// Export actions
export function requestLogin(params) {
  return {
    type: REQUEST_LOGIN,
    params,
  };
}

export function receiveLogin(data, params) {
  return {
    type: RECEIVE_LOGIN,
    data,
    params,
    receivedAt: Date.now(),
  };
}

export function badRequest(req, error) {
  return {
    type: BAD_REQUEST,
    req,
    error,
  };
}

export function login(params) {
  const { user, password } = params;
  return (dispatch) => {
    const serverUrl = '/api/login/authenticate';

    dispatch(requestLogin(params));

    return fetchData(serverUrl, {
      method: 'POST',
      body: { user, password },
    })
      .then(response => response.json())
      .then((json) => {
        if (json && json.success) {
          dispatch(receiveLogin(json.data, params));
        } else {
          dispatch(badRequest('login', 'Error happens on the backend'));
        }
      })
      .catch((e) => {
        dispatch(badRequest('login', e.toString()));
      });
  }
}