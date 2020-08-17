import * as React from 'react'
import { connect } from 'react-redux'
import { changePauseStatus, changeCurrentScreen, resetAllState } from '../actions'

import Timer from './Timer'
import GameBackground from './GameBackground'
import Player from './Player'
import Pause from './Pause'
import { Dispatch } from 'redux'
import { CanvasScreen } from '../utils/CanvasScreens'

interface GamePlayScreenProps {
  backgroundMusic: any;
  runningMusic: any;
  isPaused: boolean;
  changeCurrentScreen: (screen: CanvasScreen) => void;
  changePauseStatus: () => void;
  resetAllState: () => void;
}

class GamePlayScreen extends React.PureComponent<GamePlayScreenProps> {

  public constructor(props: GamePlayScreenProps) {
    super(props);
  }

  public componentDidMount(): void {
    window.addEventListener('keydown', this.handlePause);
  }

  public componentWillUnmount(): void {
    window.removeEventListener('keydown', this.handlePause);
    window.removeEventListener('keydown', this.handleExitAfterPause);
  }

  public render(): React.ReactElement {
    return (
      <>
        <Timer />
        <GameBackground />
        {this.props.isPaused ? <Pause /> : null}
        <Player />
      </>
    )
  }

  private handlePause = (e: KeyboardEvent) => {
    if (e.keyCode === 27) {
      if (this.props.isPaused) {
        window.removeEventListener('keydown', this.handleExitAfterPause)
        if (this.props.backgroundMusic) {
          this.props.backgroundMusic.play();
        }
      } else {
        window.addEventListener('keydown', this.handleExitAfterPause)
        if (this.props.backgroundMusic) {
          this.props.backgroundMusic.pause();
        }
        this.props.runningMusic.pause();
      }
      this.props.changePauseStatus();
    }
  }

  private handleExitAfterPause = (e: KeyboardEvent) => {
    if (e.key === 'q') {
      this.props.changeCurrentScreen(CanvasScreen.START);
      this.props.resetAllState();
    }
  }

}

const mapStateToProps = (state: any) => {
  return {
    canvas: state.canvas,
    stage: state.stage,
    backgroundMusic: state.backgroundMusic,
    isPaused: state.isPaused,
    runningMusic: state.runningMusic,
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    changePauseStatus: () => dispatch(changePauseStatus()),
    changeCurrentScreen: (screen: CanvasScreen) => dispatch(changeCurrentScreen(screen)),
    resetAllState: () => dispatch(resetAllState())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GamePlayScreen);