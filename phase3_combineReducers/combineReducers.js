function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);

  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i];
    const reducer = reducers[key];

    if (typeof reducer !== 'function') {
      throw new Error(`No reducer function provided for key "${key}"`);
    }

    const initialState = reducer(undefined, { type: 'INIT' });
    if (typeof initialState === 'undefined') {
      throw new Error(
        `The slice reducer for key "${key}" returned undefined during initialization.` +
          'If the state passed to the reducer is undefined, you must ' +
          'explicitly return the initial state. The initial state may ' +
          'not be undefined. If you don\'t want to set a value for this reducer, ' +
          'you can use null instead of undefined.'
      );
    }
  }

  return function combination(state = {}, action) {
    const nextState = {};

    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i];
      const reducer = reducers[key];

      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      if (typeof nextStateForKey === 'undefined') {
        const actionType = action && action.type;
        throw new Error(
          `When called with an action of type ${
            actionType ? `"${String(actionType)}"` : '(unknown type)'
          }, the slice reducer for key "${key}" returned undefined. ` +
            'To ignore an action, you must explicitly return the previous state. ' +
            'If you want this reducer to hold no value, you can return null instead of undefined.'
        );
      }

      nextState[key] = nextStateForKey;
    }

    return nextState;
  };
}

export default combineReducers;