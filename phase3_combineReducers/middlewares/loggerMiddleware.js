const loggerMiddleware = (store) => (next) => (action) => {
  console.log({ preState: store.getState() });
  next(action);
  console.log({ newState: store.getState() });
};

export default loggerMiddleware;
