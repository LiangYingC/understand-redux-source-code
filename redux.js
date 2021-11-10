window.Redux = {
  createStore(reducer, preloadedState) {
    let currentState = preloadedState;

    function getState() {}

    function dispatch(action) {}

    function subscribe(listener) {}

    const store = {
      getState,
      dispatch,
      subscribe,
    };

    return store;
  },
};
