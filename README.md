# Implement Simple Redux CreateStore After Reading Redux Source Code

Try to understand core api of redux (getState / dispatch / subscribe) by implementing simple redux.

Can focus on `redux.js` and `index.js` logic.

## Steps

### Step 1 : Define input and output of createStore function

1. Input : reducer and preloadedState.
2. Output : an store object contain getState、subscripe、dispatch API.

```javascript
window.Redux = {
  createStore(reducer, preloadedState) {
    const store = {
      getState,
      dispatch,
      subscribe,
    };

    return store;
  },
};
```

### Step 2 : Implment getState API to get store state

1. Initialize currentState to be preloadedState.
2. Initialize isDispatching to be false.
3. Implement getState function and will return currentState.
4. Deal with calling getState while the reducer is executing stiuation, and throw error message.

```javascript
window.Redux = {
  createStore(reducer, preloadedState) {
    let currentState = preloadedState;
    let isDispatching = false;

    function getState (){
      if (isDispatching) {
        throw new Error(
          "You may not call store.getState() while the reducer is executing. " +
            "The reducer has already received the state as an argument. " +
            "Get the state from the top reducer instead of reading it from the store."
        );
      }

      return currentState;
    };

   ......
  },
};
```

### Step 3 : Implment dispatch API to change store state

1. Initialize currentReducer to be reducer to memoize current reducer.
2. When is dispatching, throw error message.
3. let isDispatching be true when execute currentReducer.
4. Execute currentReducer and will change store state by action.
5. After executing currentReducer, let isDispatching be false.

```javascript
createStore(reducer, preloadedState) {
    ...
    let currentReducer = reducer;

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
    }
}
```

### Step 4 : Implment subscripe API to call listener after state changed by dispatching

1. Initialize listeners array list to be [].
2. Push the listener into listeners when call subscribe and return unsubscribe function which can remove the listener from listeners.
3. Deal with is dispatching situation with throwing error message.
4. Execute all subscribed listeners at the last step of dispatching.

```javascript
window.Redux = {
  createStore(reducer, preloadedState) {
    ......
    let listeners = [];

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

      return function unsubscribe() {
        if (!isSubscribed) {
          return;
        }

        if (isDispatching) {
          throw new Error(
            "You may not unsubscribe from a store listener while the reducer is executing. "
          );
        }

        isSubscribed = false;

        const index = listeners.indexOf(listener);
        listeners.splice(index, 1);
      };
    }

    let currentReducer = reducer;

    function dispatch(action) {
      ......

      for (let i = 0; i < listeners.length; i++) {
        const listener = listeners[i];
        listener();
      }
    }
    ......
  },
};
```

### Step 5 : Fix bugs when trying to subscribe / unsubscribe inside subscribe listener callback.

1. Some bugs will happended when trying to change listeners (add or remove listener) during listeners is executing on dispatching.
2. Create currentListeners and nextListeners to handle this stiuation. CurrentListeners : stable, will be execute on dispatching ; NextListeners : unstable, will be add and remove listener on subscribe and unsubscribe.
3. Create ensureCanMutateNextListeners shadow copy function to make sure currentListeners and nextListeners will be diffrent reference.
4. Call ensureCanMutateNextListeners before change nextListeners.
5. Let currentListeners = nextListeners before execute every listener on dispatching.

```javascript
window.Redux = {
  createStore(reducer, preloadedState) {
    ......
    let currentListeners = [];
    let nextListeners = currentListeners;

    function ensureCanMutateNextListeners() {
        if (nextListeners === currentListeners) {
            nextListeners = currentListeners.slice();
        }
    }

    function subscribe(listener) {
      if (isDispatching) {...}

      let isSubscribed = true;

      ensureCanMutateNextListeners();
      nextListeners.push(listener);

      return function unsubscribe() {
        if (!isSubscribed) {
          return;
        }

        if (isDispatching) {
          throw new Error(
            "You may not unsubscribe from a store listener while the reducer is executing. "
          );
        }

        isSubscribed = false;

        ensureCanMutateNextListeners();
        const index = nextListeners.indexOf(listener);
        nextListeners.splice(index, 1);
      };
    }

    let currentReducer = reducer;

    function dispatch(action) {
      ......

      const listeners = (currentListeners = nextListeners)
        for (let i = 0; i < listeners.length; i++) {
          const listener = listeners[i];
          listener();
        }
    }
    ......
  }
}
```

### Step 6 : When a store is created, an "INIT" action is dispatched so that every reducer returns their initial state.

1. Dispatch INIT action to returns initial state.
2. To avoid conflicts with the INIT action type written by user, need to combine randomString and INIT word.

```javascript
window.Redux = {
  createStore(reducer, preloadedState) {
    ......
    const randomString = () =>
      Math.random().toString(36).substring(7).split("").join(".");

    dispatch({
      type: `INIT${randomString()}`,
    });

    const store = {
      getState,
      dispatch,
      subscribe,
    };

    return store;
  }
}
```

## References

- [redux repo : redux/src/](https://github.com/reduxjs/redux/tree/master/src)
- [Learn Redux by coding a Mini-Redux](https://blog.jakoblind.no/learn-redux-by-coding-a-mini-redux/)
- [挑戰 40 分鐘實作簡易版 Redux 佐設計模式](https://modernweb.ithome.com.tw/session-inner#448)
- [從 source code 來看 Redux 更新 state 的運行機制](https://as790726.medium.com/%E5%BE%9E-source-code-%E4%BE%86%E7%9C%8B-redux-%E7%9A%84%E9%81%8B%E8%A1%8C%E6%A9%9F%E5%88%B6-f5e0adc1b9f6)
- [Redux 設計思想與工作原理](http://www.mdeditor.tw/pl/gZ9p/zh-tw)
