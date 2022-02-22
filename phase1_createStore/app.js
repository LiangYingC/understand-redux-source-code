import createStore from './createStore.js';

const initialState = {
  points: 0,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'PLUS_POINTS':
      return {
        points: state.points + action.payload,
      };
    case 'MINUS_POINTS':
      return {
        points: state.points - action.payload,
      };
    default:
      return state;
  }
};

const preloadedState = {
  points: 0,
};

const store = createStore(reducer, preloadedState);

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
