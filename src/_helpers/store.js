import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import rootReducer from '../_reducers';

const loggerMiddleware = createLogger();
const composeEnhancers = composeWithDevTools({});

export const store = createStore(
    rootReducer, composeEnhancers (
        applyMiddleware(
            thunkMiddleware,
            loggerMiddleware
        )
    )
  
);