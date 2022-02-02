const catchErrMiddleware = (store) => (next) => (action) => {
  try {
    next(action);
  } catch (err) {
    console.log({ errLog: err });
  }
};

export default catchErrMiddleware;
