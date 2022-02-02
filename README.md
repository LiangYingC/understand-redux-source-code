# 理解 Redux 原始碼

這份 repo 的目的，是用來理解 Redux 原始碼，其中分為幾個部分：

- [phase1_createStore](./phase1_createStore) : 專注在 Redux 的核心 API `getState`、`dispatch`、`subscribe` 的理解，並特別解釋 `ensureCanMutateNextListeners` 的作用。
- [phase2_middlewares](./phase2_middlewares) : 新增與 Redux middleware 相關的功能，包含創建多個 `middlewares`、解釋 `applyMiddleware`、`createStore` 的 `enhancer` 等。

每個部分都有撰寫 README.md 以及獨立文章，歡迎參閱，如果有問題歡迎發 issue 討論，謝謝。
