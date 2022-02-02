# 理解 Redux 原始碼：phase2_middlewares

> 如有時間，建議搭配 [理解 Redux 原始碼 (二)：來實作 middlewares、applyMiddleware 以及 createStore enhancer 吧](https://www.programfarmer.com/articles/sourceCode/redux-make-createStore-enhancer-and-applyMiddleware) 閱讀。

## 檔案結構

- middlewares：底下包含在此階段創建的 `middleware`，如 `loggerMiddleware.js`、`catchErrMiddleware.js`、`timeRecordMiddleware.js`。
- applyMiddleware.js：封裝整合 `middlewares` 的相關邏輯，透過 `applyMiddleware(...midlewates)` 可創建 `enhancer`。
- createStore.js：redux 核心原始碼，在此階段，會實作傳入 `enhancer` 參數的功能。
- app.js：引入 `applyMiddleware.js`、`createStore.js` 等，創建 `store` 管控應用程式的資料以及資料更新邏輯，在此階段，會新增 `middlewares` 相關概念。
- compose.js：redux 自建的 `compose`，即是實踐 functional programming 的 `compose` 概念，無須過度關注。
- app.html：應用程式的 html，可以透過 live server 打開玩玩看，無需過度關注。
- app.css：應用程式的 css，完全不用關注。

## middlewares 解讀

```javascript
/*** loggerMiddleware.js file ***/

// 創建 loggerMiddleware 會印出 preState 以及 newState
const loggerMiddleware = (store) => (next) => (action) => {
  console.log({ preState: store.getState() })
  next(action)
  console.log({ newState: store.getState() })
}
export default loggerMiddleware
```

```javascript
/*** timeRecordMiddleware.js file ***/

// 創建 loggerMiddleware 會印出更新 state 的時間
const timeRecordMiddleware = (store) => (next) => (action) => {
  console.log({ time: new Date().getTime() })
  next(action)
}
export default timeRecordMiddleware
```

```javascript
/*** catchErrMiddleware.js file ***/

// 創建 loggerMiddleware 會抓出更新 state 時的錯誤
const catchErrMiddleware = (store) => (next) => (action) => {
  try {
    next(action)
  } catch (err) {
    console.log({ errLog: err })
  }
}
export default catchErrMiddleware
```

## applyMiddleware.js 解讀

```javascript
/*** applyMiddleware.js file ***/
import compose from './compose.js'

// 執行時傳入 middlewares，創建出 enhancer
const applyMiddleware = function (...middlewares) {
  return (createStore) => (reducer, preloadedState) => {
        // 1.使用原始的 createStore 創建原始的 store
        const store = createStore(reducer, preloadedState);
        // 2.紀錄原始的 dispatch
        let dispatch = store.dispatch;

        // 3.封裝給 middleware 用的 store
        const storeForMiddleware = { getState: store.getState };
        // 4.創建 middleware chain，將每個 middleware 都傳入 store 參數
        // 產生的結果 : [logger, timeRecord, catchErr]
        const middlewareChain = middlewares.map(middleware => middleware(storeForMiddleware));
        // 5.擴展 dispatch，將 middlewares 的功能封裝其中
        // 產生的結果 : catchErr(timeRecord(logger(store.dispatch)))
        dispatch = compose(...middlewareChain)(store.dispatch);

        // 6.更新 store.dispatch
        store.dispatch = dispatch;
        return store;
    };
  };
};

export default applyMiddleware;

```

## createStore.js 解讀

```javascript
/*** createStore.js file ***/

// 多傳入 enhancer 參數，enhancer 可透過 applyMiddleware 創建
function createStore(reducer, preloadedState, enhancer) {
  // 如果有 enhancer，就使用新版的 createStore，不然就照原始 createStore 流程走
  if (enhancer) {
    const newCreateStore = enhancer(createStore)
    return newCreateStore(reducer, preloadedState)
  }

  // currentState 就是核心的 store state，初始的 preloadedState 由外部傳入
  let currentState = preloadedState
  // currentReducer 就是更新 state 會使用的 reducer，由外部傳入
  let currentReducer = reducer
  // currentListeners 以及 nextListeners 是為了 subscribe 功能而設計
  let currentListeners = []
  let nextListeners = currentListeners
  // isDispatching flag 是為了避免 reducer 中使用 getState、dispatch、subscribe 而設計
  let isDispatching = false

  // ensureCanMutateNextListeners 利用淺拷貝，確保 nextListeners 以及 currentListeners 第一層指向不同來源
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }

  // 外部可透過 store.getState 取得 store state
  function getState() {
    if (isDispatching) {...}

    return currentState
  }

  // 外部透過 store.dispatch(action) 改變 store state
  function dispatch(action) {
    if (isDispatching) {...}

    try {
      isDispatching = true
      // 透過 currentReducer 的執行，返回更新後的 store state
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }

    // store state 更新後，先更新 currentListeners，接著觸發所有訂閱的 listener
    const listeners = (currentListeners = nextListeners)
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }
  }

  // 外部透過 store.subscribe(listener) 訂閱、 unsubscribe(listener) 取消訂閱 listener
  function subscribe(listener) {
    if (isDispatching) {...}

    let isSubscribed = true

    // 將新的 listener 添加到 nextListeners 前，先確保 currentListeners 與 nextListeners 不同
    ensureCanMutateNextListeners()
    nextListeners.push(listener)

    return function unsubscribe(listener) {
      if (!isSubscribed) {
        return
      }

      if (isDispatching) {...}

      // 將 listener 從 nextListeners 移除前，先確保 currentListeners 與 nextListeners 不同
      ensureCanMutateNextListeners()
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)

      isSubscribed = false
    }
  }

  const randomString = () =>
    Math.random().toString(36).substring(7).split('').join('.')

  dispatch({
    type: `INIT${randomString()}`,
  })

  const store = {
    getState,
    dispatch,
    subscribe,
  }

  return store
}

export default createStore
```

## app.js 解讀

```javascript
/*** app.js file ***/
import createStore from './createStore.js'
import applyMiddleware from './applyMiddleware.js'
import loggerMiddleware from './loggerMiddleware.js'
import timeRecordMiddleware from './timeRecordMiddleware.js'
import catchErrMiddleware from './catchErrMiddleware.js'

// 自定義 reducer
const reducer = (state, action) => {
  switch (action.type) {
    case 'PLUS_POINTS':
      return {
        points: state.points + action.payload,
      }
    case 'MINUS_POINTS':
      return {
        points: state.points - action.payload,
      }
    default:
      return state
  }
}

// 透過 applyMiddleware，傳入多個 middlewares 創建 enhancer
const enhancer = applyMiddleware(
  catchErrMiddleware,
  timeRecordMiddleware,
  loggerMiddleware,
)

// 使用 createStore 傳入第三個參數 enhancer，創建 dispatch 已被擴展的 store
const preloadedState = {
  points: 0,
}
const store = createStore(reducer, preloadedState, enhancer)

// 當 plus 按鈕被點擊時，就觸發 callback，增加 100 points
document.getElementById('plus-points-btn').addEventListener('click', () => {
  // 此 dispatch 已可觸發 middlewares 相關功能
  store.dispatch({
    type: 'PLUS_POINTS',
    payload: 100,
  })
})

// 當 minus 按鈕被點擊時，就觸發 callback，減少 100 points
document.getElementById('minus-points-btn').addEventListener('click', () => {
  // 此 dispatch 已可觸發 middlewares 相關功能
  store.dispatch({
    type: 'MINUS_POINTS',
    payload: 100,
  })
})

// 透過 subscribe 訂閱機制，當資料被更新時，就會執行傳入的 callback
store.subscribe(() => {
  const points = store.getState().points
  document.getElementById('display-points-automatically').textContent = points
})
```

#### 如有問題，歡迎發 issue 討論，謝謝！
