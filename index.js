/* const { createStore } = Redux; (can open this when use real redux at index.html) */
const { createStore } = window.Redux;

const initialState = {
  points: 0,
};

// create reducer by yourself
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "PLUS_POINTS":
      return {
        points: state.points + action.payload,
      };
    case "MINUS_POINTS":
      return {
        points:
          state.points === 0 ? state.points : state.points - action.payload,
      };
    default:
      return state;
  }
};

const preloadedState = {
  points: 0,
};

// create store by redux
const store = createStore(reducer, preloadedState);

// plus points by store.dispatch after click plus points btn
document.getElementById("plus-points-btn").addEventListener("click", () => {
  store.dispatch({
    type: "PLUS_POINTS",
    payload: 100,
  });
});

// minus points by store.dispatch after click minus points btn
document.getElementById("minus-points-btn").addEventListener("click", () => {
  store.dispatch({
    type: "MINUS_POINTS",
    payload: 100,
  });
});

// display points automatically by store.subscribe
store.subscribe(() => {
  document.getElementById("display-points-automatically").textContent =
    store.getState().points;
});

// display points manually by click get points button
document.getElementById("get-points-btn").addEventListener("click", () => {
  document.getElementById("display-points-manually").textContent =
    store.getState().points;
});
