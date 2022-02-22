import createStore from './createStore.js';
import applyMiddleware from './applyMiddleware.js';
import loggerMiddleware from './middlewares/loggerMiddleware.js';
import timeRecordMiddleware from './middlewares/timeRecordMiddleware.js';
import catchErrMiddleware from './middlewares/catchErrMiddleware.js';
import combineReducers from './combineReducers.js';

const preloadedState = {
  points: 0,
  user: {
    name: 'Liang',
    age: 18,
  },
};

const pointsReducer = (
  state = preloadedState.points, 
  action
) => {
  switch (action.type) {
    case 'PLUS_POINTS':
      return state + action.payload;
    case 'MINUS_POINTS':
      return state - action.payload;
    default:
      return state;
  }
};

const userReducer = (
  state = preloadedState.user, 
  action
) => {
  switch (action.type) {
    case 'UPDATE_NAME':
      return {
        ...state,
        name: action.name,
      };
    case 'UPDATE_AGE':
      return {
        ...state,
        age: action.age,
      };
    default:
      return state;
  }
};

const reducer = combineReducers({
  points: pointsReducer,
  user: userReducer,
});

const enhancer = applyMiddleware(
  catchErrMiddleware, 
  timeRecordMiddleware, 
  loggerMiddleware
);

const store = createStore(reducer, preloadedState, enhancer);

document.getElementById('plus-points-btn').addEventListener('click', () => {
  store.dispatch({
    type: 'PLUS_POINTS',
    payload: 100,
  });
});

document.getElementById('minus-points-btn').addEventListener('click', () => {
  store.dispatch({
    type: 'MINUS_POINTS',
    payload: 100,
  });
});

store.subscribe(() => {
  document.getElementById('display-points-automatically').textContent =
    store.getState().points;
});

document.getElementById('get-points-btn').addEventListener('click', () => {
  document.getElementById('display-points-manually').textContent =
    store.getState().points;
});
