import * as React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import App from './App';
import {Provider} from 'react-redux';
import createMockStore from 'redux-mock-store';
import {initialState} from './store/initialState';
import {Actions} from './store/Actions';
import {CanvasScreen} from './utils/CanvasScreens';

describe('Impatience', () => {

  describe('App', () => {

    test('renders the game canvas', () => {
      const store = createMockStore()(initialState);
      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      expect(screen.getByRole('img')).toBeDefined();
    });

    test('is able to enter the game play screen', () => {
      const store = createMockStore()(initialState);
      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      expect(store.getActions().length).toBe(0);

      fireEvent.keyDown(
        document, 
        { key: 'Enter', code: 'Enter' }
      );

      expect(store.getActions().length).toBe(1);
      expect(store.getActions()[0]).toEqual(Actions.changeCurrentScreen(CanvasScreen.GAME_PLAY));
    });

    test('is able to enter the high scores screen', () => {
      const store = createMockStore()(initialState);
      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      expect(store.getActions().length).toBe(0);

      fireEvent.keyDown(
        document, 
        { key: 'ArrowDown', code: 'ArrowDown' }
      );

      fireEvent.keyDown(
        document, 
        { key: 'Enter', code: 'Enter' }
      );

      expect(store.getActions().length).toBe(1);
      expect(store.getActions()[0]).toEqual(Actions.changeCurrentScreen(CanvasScreen.HIGH_SCORES));
    });

    test('is able to enter the instructions screen', () => {
      const store = createMockStore()(initialState);
      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      expect(store.getActions().length).toBe(0);

      fireEvent.keyDown(
        document, 
        { key: 'ArrowDown', code: 'ArrowDown' }
      );

      fireEvent.keyDown(
        document, 
        { key: 'ArrowDown', code: 'ArrowDown' }
      );

      fireEvent.keyDown(
        document, 
        { key: 'Enter', code: 'Enter' }
      );

      expect(store.getActions().length).toBe(1);
      expect(store.getActions()[0]).toEqual(Actions.changeCurrentScreen(CanvasScreen.INSTRUCTIONS));
    });
    
  });

});
