import compose from './compose.js';

const applyMiddleware = function (...middlewares) {
  return (createStore) => (reducer, preloadedState) => {
    const store = createStore(reducer, preloadedState);
    let dispatch = store.dispatch;

    const storeForMiddleware = { getState: store.getState };
    const middlewareChain = middlewares.map(middleware => middleware(storeForMiddleware));
    dispatch = compose(...middlewareChain)(store.dispatch);

    store.dispatch = dispatch;
    return store;
  };
};

export default applyMiddleware;

