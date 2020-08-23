import * as React from 'react';
import {connect} from 'react-redux';
import StartScreen from './StartScreen';
import HighScores from './components/HighScores';
import Instructions from './components/Instructions';
import {CanvasScreen} from './utils/CanvasScreens';
import {AppState} from './store/initialState';
import {canvasWidth, canvasHeight} from './setupData';
import GamePlayContainer from './components/GamePlayContainer';
import './App.css';

interface AppProps {
  bumpingShake: boolean;
  currentScreen: CanvasScreen;
}

interface InnerAppState {
  canvas: HTMLCanvasElement | null;
  canvasContext: CanvasRenderingContext2D | null;
}

export interface ScreenProps {
  canvas: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
}

class App extends React.PureComponent<AppProps, InnerAppState> {
  private static CANVAS_ROUTING: Map<CanvasScreen, any> = new Map<CanvasScreen, any>([
    [CanvasScreen.START, StartScreen],
    [CanvasScreen.HIGH_SCORES, HighScores],
    [CanvasScreen.INSTRUCTIONS, Instructions],
    [CanvasScreen.GAME_PLAY, GamePlayContainer]
  ]);

  public constructor(props: AppProps) {
    super(props);
    this.state = {
      canvas: null,
      canvasContext: null
    };
  }

  public render(): React.ReactElement {
    const Screen: React.ComponentClass<ScreenProps> = App.CANVAS_ROUTING.get(this.props.currentScreen);
    return (
      <>
        <canvas 
          width={canvasWidth} 
          height={canvasHeight} 
          ref={this.retrieveCanvas} 
          id={'playArea'}
          className={this.props.bumpingShake ? 'bumpingShake' : ''}
          role={'img'}
        />
        {this.state.canvasContext && this.state.canvas && <Screen canvasContext={this.state.canvasContext} canvas={this.state.canvas}/> }
      </>
    );
  }

  private retrieveCanvas = (canvas: HTMLCanvasElement | null) => {
    if ( canvas ) {
      this.setState({ 
        canvas,
        canvasContext: canvas.getContext('2d')
      });
    }
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    currentScreen: state.currentScreen,
    bumpingShake: state.bumpingShake
  };
}

export default connect(mapStateToProps)(App);