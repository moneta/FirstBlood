import fetchData from '../../../common/utils/fetchData';

const REQUEST_MATCH = 'match/REQUEST_MATCH';
const RECEIVE_MATCH = 'match/RECEIVE_MATCH';
const BAD_REQUEST = 'match/BAD_REQUEST';

export const ActionTypes = {
  REQUEST_MATCH,
  RECEIVE_MATCH,
  BAD_REQUEST,
};

const initialState = {
  polygon: [],
};

export default function match(state = initialState, action = {}) {
  switch (action.type) {
    case RECEIVE_MATCH:
      return {
        ...action.data,
      };
    default:
      return state;
  }
}

// Export actions
export function requestMatch(params) {
  return {
    type: REQUEST_MATCH,
    params,
  };
}

export function receiveMatch(data, params) {
  return {
    type: RECEIVE_MATCH,
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

export function searchPlayers(params) {
  const { userId } = params;
  return (dispatch) => {
    const serverUrl = '/api/find/user/:userId';

    dispatch(requestMatch(params));

    return fetchData(serverUrl, {
      method: 'GET',
      params: { userId },
    })
      .then(response => response.json())
      .then((json) => {
        if (json && json.success) {
          dispatch(receiveMatch(json.data, params));
        } else {
          dispatch(badRequest('searchPlayers', 'Error happens on the backend'));
        }
      })
      .catch((e) => {
        dispatch(badRequest('searchPlayers', e.toString()));
      });
  }
}