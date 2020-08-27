import * as React from 'react';
import { connect } from 'react-redux'
import { canvasWidth, statusBarHeight } from '../setupData'
import {Actions} from '../store/Actions';

import Patience from './Patience'
import Ability from './Ability'
import { AppState } from '../store/initialState';
import { Dispatch } from 'redux';
import { ScreenProps } from '../App';

interface TimerProps extends ScreenProps {
  movement: number;
  streak: number[];
  patience: number;
  time: number;
  totalPausedTime: number | null;
  isPaused: boolean;
  setGameOverImage: (image: string) => void;
  recordTimeFinished: (time: number) => void;
  modifyPatience: (modifier: number) => void;
  recordStreak: (streak: number) => void;
  incrementTime: (time: number) => void;
}

interface TimerState {
  willBeDone: boolean;
  startTime: Date | number;
}

interface FormattedGameTime {
  minutes: number;
  seconds: number;
  milliseconds: number;
}

class Timer extends React.Component<TimerProps, TimerState> {
  public constructor(props: TimerProps) {
    super(props);
    this.state = {
      willBeDone: false,
      startTime: 0
    };
  }

  public componentDidMount(): void {
    window.addEventListener('keydown', this.incrementTime);
    this.drawStatusBar();
    this.drawTime(this.props.canvasContext);
  }

  public shouldComponentUpdate(): boolean {
    if (this.state.willBeDone) { return false }
    return true
  }

  public showGameOverScreen = (): void => {
    // TODO: Renable this as a more specific context was passed thorugh here
    const gameOverImg = this.props.canvas.toDataURL("image/png")
    this.props.setGameOverImage(gameOverImg)
  }

  public componentDidUpdate(): void {
    if (this.props.patience <= 0) {
      this.props.recordStreak(this.props.movement);
      this.props.recordTimeFinished(this.props.time/1000);
      this.showGameOverScreen();
    }
  }

  public render(): React.ReactElement {
    this.drawStatusBar();
    return (
      <>
        <Patience canvasContext={this.props.canvasContext} canvas={this.props.canvas}/>
        <Ability canvasContext={this.props.canvasContext} canvas={this.props.canvas}/>
      </>
    )
  }

  private formatTime(): FormattedGameTime {
    return {
      minutes: Math.trunc((this.props.time/1000)/60), 
      seconds: Math.trunc((this.props.time/1000) % (60)), 
      milliseconds: this.props.time % 1000
    };
  }

  private drawStatusBar = (): void => {
    this.props.canvasContext.clearRect(canvasWidth*0.70, 0, canvasWidth*0.30, statusBarHeight);
    this.props.canvasContext.fillStyle = 'black';
    this.props.canvasContext.fillRect(canvasWidth*0.70, 0, canvasWidth*0.30, statusBarHeight);
    this.drawTime(this.props.canvasContext);
  }

  private drawTime = (ctx: CanvasRenderingContext2D) => {
    const currentTime = this.formatTime()
    ctx.textAlign = 'center'
    ctx.font = "20px Geneva"
    ctx.fillStyle = "white"
    ctx.fillText(`Time`, canvasWidth-110, 30)

    ctx.textAlign = 'center'
    ctx.font = "36px Geneva"
    ctx.fillStyle = "red"
    ctx.fillText(`${("0" + currentTime.minutes).slice(-2)}:${("0" + currentTime.seconds).slice(-2)}`, canvasWidth-110, 70)
  }

  private incrementTime = (e: KeyboardEvent): void => {
    if ( e.key === 'ArrowUp' ) {
      this.setState({ startTime: new Date() }, () => {
        setInterval(() => {
          if ( !this.props.isPaused ) {
            this.props.incrementTime(((new Date() as unknown as number) - (this.state.startTime as unknown as number)) - Number(this.props.totalPausedTime));
          }
        }, 1000);
        window.removeEventListener('keydown', this.incrementTime);
      })
    }
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    movement: state.movement,
    streak: state.streak,
    patience: state.patience,
    time: state.time,
    totalPausedTime: state.totalPausedTime,
    isPaused: state.isPaused
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setGameOverImage: (image: string) => dispatch(Actions.setGameOverImage(image)),
    recordTimeFinished: (time: number) => dispatch(Actions.recordTimeFinished(time)),
    modifyPatience: (modifier: number) => dispatch(Actions.modifyPatience(modifier)),
    recordStreak: (streak: number) => dispatch(Actions.recordStreak(streak)),
    incrementTime: (time: number) => dispatch(Actions.incrementTime(time))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Timer);