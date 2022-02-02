# 理解 Redux 原始碼：phase3_combineReducers

> 如有時間，建議搭配 [理解 Redux 原始碼 (三)：來實作 combineReducers 吧](https://www.programfarmer.com/articles/sourceCode/redux-make-combineReducers) 閱讀。

## 檔案結構

- combineReducers.js：本階段實作的重點，可傳入多個 `reducers`，創建出最終傳入 `createStore` 的 `reducer`。
- app.js：引入 `combineReducers.js`、`createStore.js`、`applyMiddleware.js` 等，創建 `store` 管控應用程式的資料以及資料更新邏輯，其中透過 `combineReducers` 合併多個 `reeducers`。
- middlewares：底下包含多個 `middlewares`。
- applyMiddleware.js：封裝整合 `middlewares` 的相關邏輯，透過 `applyMiddleware(...midlewates)` 可創建 `enhancer`。
- createStore.js：redux 核心原始碼，透過 `createStore(reducer, preloadedState, enhancer)` 可創建 `store`。
- compose.js：redux 自建的 `compose`，無須過度關注。
- app.html：應用程式的 html，可以透過 live server 打開玩玩看，無需過度關注。
- app.css：應用程式的 css，完全不用關注。

## combineReducers 解讀

```javascript
/*** combineReducers.js file ***/

// 定義 input 為 reducers obj，key 是 store state 的 state key ; value 是更新對應 state 的 reducer function
function combineReducers(reducers) {
  // 取得 reducerKeys = ['points', 'user']
  const reducerKeys = Object.keys(reducers)

  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i]
    const reducer = reducers[key]

    // 檢查每個 reducer 是否為 function，如果不是就報錯
    if (typeof reducer !== 'function') {
      throw new Error(`No reducer function provided for key "${key}"`)
    }

    // 檢查每個 initial state 是否為 undefined，如果是就報錯
    const initialState = reducer(undefined, { type: ActionTypes.INIT })
    if (typeof initialState === 'undefined') {
      throw new Error(
        `The slice reducer for key "${key}" returned undefined during initialization.` +
          `If the state passed to the reducer is undefined, you must ` +
          `explicitly return the initial state. The initial state may ` +
          `not be undefined. If you don't want to set a value for this reducer, ` +
          `you can use null instead of undefined.`,
      )
    }
  }

  // 定義 ouput 為可傳入 state、action 的 combination function
  return function combination(state = {}, action) {
    const nextState = {}

    // 遍歷執行每一個 reducer，藉此整合出最終的 newState
    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i]
      const reducer = reducers[key]

      // 取得舊的 previousStateForKey
      const previousStateForKey = state[key]
      // 執行 reducer，獲得的 nextStateForKey
      const nextStateForKey = reducer(previousStateForKey, action)
      // 因為前面已檢查 reducer 的 state 傳入 undefined 時是否正常
      // 所以在此 undefined 的原因，就會是 action 有誤，因此報錯
      if (typeof nextStateForKey === 'undefined') {
        const actionType = action && action.type
        throw new Error(
          `When called with an action of type ${
            actionType ? `"${String(actionType)}"` : '(unknown type)'
          }, the slice reducer for key "${key}" returned undefined. ` +
            `To ignore an action, you must explicitly return the previous state. ` +
            `If you want this reducer to hold no value, you can return null instead of undefined.`,
        )
      }

      // 將 nextStateForKey 整合進 nextState 中
      nextState[key] = nextStateForKey
    }

    // 最後回傳整合完成的 nextState
    return nextState
  }
}

export default combineReducers
```

## app.js 解讀

```javascript
import createStore from './createStore.js'
import applyMiddleware from './applyMiddleware.js'
import loggerMiddleware from './middlewares/loggerMiddleware.js'
import timeRecordMiddleware from './middlewares/timeRecordMiddleware.js'
import catchErrMiddleware from './middlewares/catchErrMiddleware.js'
import combineReducers from './combineReducers.js'

const preloadedState = {
  points: 0,
  user: {
    name: 'Liang',
    age: 18,
  },
}

// pointsReducer 規範 points 的更新
const pointsReducer = (state = preloadedState.points, action) => {
  switch (action.type) {
    case 'PLUS_POINTS':
      return state + action.payload
    case 'MINUS_POINTS':
      return state - action.payload
    default:
      return state
  }
}

// userReducer 規範 user 的更新
const userReducer = (state = preloadedState.user, action) => {
  switch (action.type) {
    case 'UPDATE_NAME':
      return {
        ...state,
        name: action.name,
      }
    case 'UPDATE_AGE':
      return {
        ...state,
        age: action.age,
      }
    default:
      return state
  }
}

// 透過 combineReducers，整合出最終單一的 reducer
const reducer = combineReducers({
  points: pointsReducer,
  user: userReducer,
})

const enhancer = applyMiddleware(
  catchErrMiddleware,
  timeRecordMiddleware,
  loggerMiddleware,
)

// 將整合後的 reducer 傳入 createStore
const store = createStore(reducer, preloadedState, enhancer)

......
```

#### 如有問題，歡迎發 issue 討論，謝謝！
