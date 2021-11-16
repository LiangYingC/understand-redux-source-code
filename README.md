# Implement Simple Redux CreateStore After Reading Redux Source Code

Try to understand core api of redux (getState / dispatch / subscribe) by implementing simple redux.

In this project, i make a simple points counter app by `index.html`, `index.css` and `index.js` which is used `redux createStore` made by myself.

If u just want to know how to make simple `redux createStore`, can focus on `README.md` amd `createStore.js` files.

If u want to read how to make simple `redux createStore` article in Traditional Chinese (zh-tw), can click [理解 Redux 原始碼：來實作簡單的 Redux createStore 吧](http://localhost:3000/articles/javaScript/javascript-make-simple-redux-createStore).

## Steps of making simple createStore

### Step 1 : Define input and output of createStore function

1. Input : reducer and preloadedState.
2. Output : an store object contain getState、subscribe、dispatch API.

```javascript
createStore(reducer, preloadedState) {

  function getState() {};

  function dispatch() {};

  function subscribe() {};

  const store = {
    getState,
    dispatch,
    subscribe,
  };

  return store;
};
```

### Step 2 : Implment getState API to get store state

1. Declare currentState and assign preloadedState value.
2. Implement getState function and will return currentState.

```javascript
createStore(reducer, preloadedState) {
  let currentState = preloadedState;

  function getState() {
    return currentState
  };

  function dispatch() {};

  function subscribe() {};

  const store = {
    getState,
    dispatch,
    subscribe,
  };

  return store;
}
```

### Step 3 : Implment dispatch API to change store state

1. Initialize currentReducer to be reducer to memoize current reducer.
2. Declare isDispatching flag to know currentReducer is executing or not.
3. When isDispatching is true, getState and dispatch will throw err message.
4. Let isDispatching be true before executing currentReducer and be false after executing currentReducer.
5. Execute currentReducer(currentState, action) will return new store state.

```javascript
createStore(reducer, preloadedState) {
  ...
  let currentReducer = reducer;
  let isDispatching = false;

  function getState() {
    // when reducer executing, throw error message.
    if (isDispatching) {
        throw new Error(
          "You may not call store.getState() while the reducer is executing. " +
            "The reducer has already received the state as an argument. " +
            "Get the state from the top reducer instead of reading it from the store."
        );
      }

      return currentState;
  };

  function dispatch(action) {
    // when reducer executing, throw error message.
    if (isDispatching) {
        throw new Error(
          "Reducers may not dispatch actions when isDispatching."
        );
    }

    try {
        // turn isDispatching to true before executing currentReducer
        isDispatching = true;
        // execute currentReducer(currentState, action) will return new state
        currentState = currentReducer(currentState, action);
    } finally {
        // turn isDispatching to false after executing currentReducer
        isDispatching = false;
    }
  };
  ...
}
```

### Step 4 : Implment subscribe API to call listener after state changed in dispatch function

1. Decare listeners and assign [].
2. Push the listener into listeners when call subscribe and return unsubscribe which can remove the listener from listeners.
3. Deal with dispatching situation by throwing error message.
4. Execute all subscribed listeners at the last step of dispatching.

```javascript
createStore(reducer, preloadedState) {
  ......
  let listeners = [];

  function subscribe(listener) {
    // when reducer executing, throw error message.
    if (isDispatching) {
      throw new Error(
        "You may not call store.subscribe() while the reducer is executing. " +
          "If you would like to be notified after the store has been updated, " +
          "subscribe from a component and invoke store.getState() in the callback to access the latest state."
      );
    }

    let isSubscribed = true;

    // add listener to listeners
    listeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      // when reducer executing, throw error message.
      if (isDispatching) {
        throw new Error(
          "You may not unsubscribe from a store listener while the reducer is executing. "
        );
      }

      // remove listener from listeners
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);

      isSubscribed = false;
    };
  }

  function dispatch(action) {
    ...
    // execute every listener after store state changed
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
  }
  ...
}
```

### Step 5 : Fix bugs when trying to subscribe / unsubscribe inside subscribe listener callback.

1. Some bugs will happended when trying to change listeners (add or remove listener) during listeners is executing on dispatch last step.
2. Create currentListeners and nextListeners to handle this stiuation.
   - currentListeners : stable, will be execute on dispatching last step.
   - nextListeners : unstable, will be add and remove listener on subscribe and unsubscribe.
3. Create ensureCanMutateNextListeners function to use shadow copy to make sure currentListeners and nextListeners will be different reference.
4. Call ensureCanMutateNextListeners before change nextListeners.
5. Let currentListeners = nextListeners before execute every listener on dispatching last step.

```javascript
createStore(reducer, preloadedState) {
  ...
  // create currentListeners and nextListeners
  let currentListeners = [];
  let nextListeners = currentListeners;

  function getState() {...};

  function dispatch(action) {
    ...
    // let currentListeners = nextListeners before executing every listener of currentListeners
    const listeners = (currentListeners = nextListeners);
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
  };

  // use shadow copy to make sure nextListeners and currentListeners are different reference
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  function subscribe(listener) {
    ...
    // replace listeners with nextListeners
    // execute ensureCanMutateNextListeners before pushing listener to nextListeners
    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return unsubscribe () {
      ...
      // replace listeners with nextListeners
      // execute ensureCanMutateNextListeners before removing listener from nextListeners
      ensureCanMutateNextListeners();
      const index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);

      isSubscribed = false;
    }
  };
  ...
}
```

### Step 6 : When a store is created, an "INIT" action is dispatched so that every reducer returns their initial state.

1. Dispatch INIT action to returns initial state.
2. To avoid conflicts with the INIT action type written by user, need to combine randomString and INIT word.

```javascript
createStore(reducer, preloadedState) {
  ...
  const randomString = () =>
    Math.random().toString(36).substring(7).split("").join(".");

  dispatch({
    type: `INIT${randomString()}`,
  });
  ...
}
```

all createStore code can read on [Implement-Simple-Redux/createStore.js](https://github.com/LiangYingC/Implement-Simple-Redux/blob/master/createStore.js).

## References articles

- [redux repo](https://github.com/reduxjs/redux/tree/master/src)
- [挑戰 40 分鐘實作簡易版 Redux 佐設計模式](https://modernweb.ithome.com.tw/session-inner#448)
- [從 source code 來看 Redux 更新 state 的運行機制](https://as790726.medium.com/%E5%BE%9E-source-code-%E4%BE%86%E7%9C%8B-redux-%E7%9A%84%E9%81%8B%E8%A1%8C%E6%A9%9F%E5%88%B6-f5e0adc1b9f6)
- [Redux 設計思想與工作原理](http://www.mdeditor.tw/pl/gZ9p/zh-tw)
