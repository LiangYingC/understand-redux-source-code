window.Redux = {
  createStore(reducer, preloadedState) {
    let currentState = preloadedState;
    let currentReducer = reducer;
    let listeners = [];
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

    function dispatch(action) {
      if (isDispatching) {
        throw new Error(
          "Reducers may not dispatch actions when isDispatching."
        );
      }

      try {
        isDispatching = true;
        currentState = currentReducer(currentState, action);
      } finally {
        isDispatching = false;
      }

      for (let i = 0; i < listeners.length; i++) {
        const listener = listeners[i];
        listener();
      }
    }

    function subscribe(listener) {
      if (isDispatching) {
        throw new Error(
          "You may not call store.subscribe() while the reducer is executing. " +
            "If you would like to be notified after the store has been updated, " +
            "subscribe from a component and invoke store.getState() in the callback to access the latest state."
        );
      }

      let isSubscribed = true;

      listeners.push(listener);

      return function unsubscribe(listener) {
        if (!isSubscribed) {
          return;
        }

        if (isDispatching) {
          throw new Error(
            "You may not unsubscribe from a store listener while the reducer is executing. "
          );
        }

        const index = listeners.indexOf(listener);
        listeners.splice(index, 1);

        isSubscribed = false;
      };
    }

    const store = {
      getState,
      dispatch,
      subscribe,
    };

    return store;
  },
};
