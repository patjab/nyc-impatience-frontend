import * as React from 'react'
import {connect} from 'react-redux'
import {canvasWidth, canvasHeight} from './setupData'
import {modularWithNegative} from './AuxiliaryMath'
import {CanvasScreen} from './utils/CanvasScreens'
import {Dispatch} from 'redux'
import {Actions} from './store/Actions';
import { ScreenProps } from './App'

interface StartScreenProps extends ScreenProps {
  changeCurrentScreen: (screen: CanvasScreen) => void;
}

interface StartScreenState {
  choice: number;
}

class StartScreen extends React.PureComponent<StartScreenProps, StartScreenState> {
  // private readonly startScreen: React.RefObject<HTMLCanvasElement>;

  public constructor(props: StartScreenProps) {
    super(props);
    // this.startScreen = React.createRef();
    this.state = {
      choice: 0
    };  
  }

  public componentDidMount(): void {
    window.addEventListener('keydown', this.userInputStartScreen);
    this.userMenu(this.props.canvasContext);
  }

  public componentDidUpdate(): void {
    this.userMenu(this.props.canvasContext);
  }

  public componentWillUnmount(): void {
    window.removeEventListener('keydown', this.userInputStartScreen);
  }

  public render(): React.ReactElement {
    return (<></>);
  }

  private playAudio = (src: string) => {
    const audioEl = document.createElement('audio');
    audioEl.setAttribute('id', src);
    audioEl.src = src;
    audioEl.play();
  }

  private userInputStartScreen = (e: KeyboardEvent) => {
    e.preventDefault();
    if ( e.key === 'Enter' ) {
      switch(this.state.choice) {
        case 0:
          this.props.changeCurrentScreen(CanvasScreen.GAME_PLAY)
          this.playAudio('./start.wav')
          break
        case 1:
          this.props.changeCurrentScreen(CanvasScreen.HIGH_SCORES)
          break
        case 2:
          this.props.changeCurrentScreen(CanvasScreen.INSTRUCTIONS)
          break
        default:
          break
      }
    }

    if ( e.key === 'ArrowUp' || e.key === 'ArrowDown' ) {
      if ( e.key === 'ArrowUp' ) {
        this.setState({choice: modularWithNegative(this.state.choice-1, 3)});
      } else if ( e.key === 'ArrowDown' ) {
        this.setState({choice: modularWithNegative(this.state.choice+1, 3)});
      }
      this.playAudio('./select.wav');
    }
  }

  private userMenu = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    ctx.rect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.closePath();

    ctx.textAlign = 'center';
    ctx.font = "100px Impact";
    ctx.fillStyle = "white";
    ctx.fillText("IMPATIENCE", canvasWidth/2, canvasHeight/2 - 300);

    ctx.textAlign = 'center';
    ctx.font = "40px Geneva";
    ctx.fillStyle = this.state.choice === 0 ? "red" : "white";
    ctx.fillText("Play Game", canvasWidth/2, canvasHeight/2 - 100);

    ctx.textAlign = 'center';
    ctx.font = "40px Geneva";
    ctx.fillStyle = this.state.choice === 1 ? "red" : "white";
    ctx.fillText("High Scores", canvasWidth/2, canvasHeight/2);

    ctx.textAlign = 'center';
    ctx.font = "40px Geneva";
    ctx.fillStyle = this.state.choice === 2 ? "red" : "white";
    ctx.fillText("Information", canvasWidth/2, canvasHeight/2 + 100);
  }
}


const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    changeCurrentScreen: (screen: CanvasScreen) => dispatch(Actions.changeCurrentScreen(screen))
  };
}

export default connect(null, mapDispatchToProps)(StartScreen)
