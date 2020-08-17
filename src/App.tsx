import * as React from 'react';
import {connect} from 'react-redux';
import StartScreen from './StartScreen';
import Canvas from './components/Canvas';
import HighScores from './components/HighScores';
import Instructions from './components/Instructions';
import {CanvasScreen} from './utils/CanvasScreens';
import './App.css';
import { AppState } from './store/initialState';

interface AppProps {
  currentScreen: CanvasScreen;
}

class App extends React.PureComponent<AppProps> {
  private static CANVAS_ROUTING: Map<CanvasScreen, React.ReactElement> = new Map([
    [CanvasScreen.START, <StartScreen/>],
    [CanvasScreen.HIGH_SCORES, <HighScores/>],
    [CanvasScreen.INSTRUCTIONS, <Instructions/>]
  ]);

  public constructor(props: AppProps) {
    super(props);
  }

  public render(): React.ReactElement {
    return App.CANVAS_ROUTING.get(this.props.currentScreen) || <Canvas/>;
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    currentScreen: state.currentScreen
  };
}

export default connect(mapStateToProps)(App);