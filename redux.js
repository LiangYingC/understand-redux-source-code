window.Redux = {
  createStore(reducer, preloadedState) {
    let currentState = preloadedState;
    let isDispatching = false;

    function getState() {
      if (isDispatching) {
        throw new Error(
          "You may not call store.getState() while the reducer is executing. " +
            "The reducer has already received the state as an argument. " +
            "Get the state from the top reducer instead of reading it from the store."
        );
      }

      return currentState;
    }

    function dispatch() {}

    function subscribe() {}

    const store = {
      getState,
      dispatch,
      subscribe,
    };

    return store;
  },
};
