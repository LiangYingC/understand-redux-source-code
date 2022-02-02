# 理解 Redux 原始碼：phase1_createStore

> 如有時間，建議搭配 [理解 Redux 原始碼 (一)：來實作 createStore 的 getState、dispatch、subscribe 吧](https://www.programfarmer.com/articles/sourceCode/redux-make-createStore-getState-dispatch-subscribe) 閱讀。

## 檔案結構

- createStore.js：redux 核心原始碼，在此階段，會實作 `getState`、`dispatch`、`subscribe` API。
- app.js：引入 `createStore.js`，創建 `store` 管控應用程式的資料以及資料更新邏輯。
- app.html：應用程式的 html，可以透過 live server 打開玩玩看，無需過度關注。
- app.css：應用程式的 css，完全不用關注。

## createStore.js 解讀

```javascript
/*** createStore.js file ***/

// 可傳入 reducer, preloadedState，創建 store
function createStore(reducer, preloadedState) {
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
    if (isDispatching) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing. ' +
          'The reducer has already received the state as an argument. ' +
          'Get the state from the top reducer instead of reading it from the store.',
      )
    }

    return currentState
  }

  // 外部透過 store.dispatch(action) 改變 store state
  function dispatch(action) {
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions when isDispatching.')
    }

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
    if (isDispatching) {
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing. ' +
          'If you would like to be notified after the store has been updated, ' +
          'subscribe from a component and invoke store.getState() in the callback to access the latest state.',
      )
    }

    let isSubscribed = true

    // 將新的 listener 添加到 nextListeners 前，先確保 currentListeners 與 nextListeners 不同
    ensureCanMutateNextListeners()
    nextListeners.push(listener)

    return function unsubscribe(listener) {
      if (!isSubscribed) {
        return
      }

      if (isDispatching) {
        throw new Error(
          'You may not unsubscribe from a store listener while the reducer is executing. ',
        )
      }

      // 將 listener 從 nextListeners 移除前，先確保 currentListeners 與 nextListeners 不同
      ensureCanMutateNextListeners()
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)

      isSubscribed = false
    }
  }

  const randomString = () =>
    Math.random().toString(36).substring(7).split('').join('.')

  // initialize，透過 randomString() 避免與外部使用者定義的 INIT action type 撞名
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

// 自定義 reducer
const reducer = (state, action) => {
  switch (action.type) {
    // 如果接收到 PLUS_POINTS 的 action.type，就增加 points
    case 'PLUS_POINTS':
      return {
        points: state.points + action.payload,
      }
    // 如果接收到 MINUS_POINTS 的 action.type，就減少 points
    case 'MINUS_POINTS':
      return {
        points: state.points - action.payload,
      }
    default:
      return state
  }
}

// 將自定義的 reducer 傳入 createStore 中，藉此創建 store
// store 會提供 getState、dispatch、subscribe API
const preloadedState = {
  points: 0,
}
const store = createStore(reducer, preloadedState)

// 當 plus 按鈕被點擊時，就觸發 callback，增加 100 points
document.getElementById('plus-points-btn').addEventListener('click', () => {
  // 透過 dispatch { type: 'PLUS_POINTS', payload: 100 }
  // 將 store state 中的 points 增加 100
  store.dispatch({
    type: 'PLUS_POINTS',
    payload: 100,
  })
})

// 當 minus 按鈕被點擊時，就觸發 callback，減少 100 points
document.getElementById('minus-points-btn').addEventListener('click', () => {
  // 透過 dispatch { type: 'MINUS_POINTS', payload: 100 }
  // 將 store state 中的 points 減少 100
  store.dispatch({
    type: 'MINUS_POINTS',
    payload: 100,
  })
})

// 透過 subscribe 訂閱機制，當資料被更新時，就會執行傳入的 callback
store.subscribe(() => {
  // 透過 getState 取出最新的 points 並 render 到畫面上
  const points = store.getState().points
  document.getElementById('display-points-automatically').textContent = points
})
```

#### 如有問題，歡迎發 issue 討論，謝謝！
