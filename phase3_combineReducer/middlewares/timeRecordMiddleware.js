const timeRecordMiddleware = (store) => (next) => (action) => {
  console.log({ time: new Date().getTime() });
  next(action);
};

export default timeRecordMiddleware;
