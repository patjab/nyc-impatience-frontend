import * as React from 'react';
import {connect} from 'react-redux';
import {backgroundMusicOn, loudnessSpookLevel, loudnessRechargeInSeconds} from '../setupData';
import {microphoneRunner, loudEnough} from '../mediaHelper/microphoneHelper';
import {Actions} from '../store/Actions';
import GamePlayScreen from './GamePlayScreen';
import GameStatistics from './GameStatistics';
import {AppState} from '../store/initialState';
import {Dispatch} from 'redux';
import {ScreenProps} from '../App';

interface GamePlayContainerProps extends ScreenProps {
  timeFinished: number | null;
  touristRoaster: React.Component[];
  time: number;
  timeOfYell: number;
  setBackgroundMusicRef: (musicRef: HTMLAudioElement) => void;
  setSnowMusicRef: (musicRef: HTMLAudioElement) => void;
  recordTimeOfYell: (time: number) => void;
}

interface GamePlayContainerState {
  scaredTouristListener: number | null;
}

class GamePlayContainer extends React.PureComponent<GamePlayContainerProps, GamePlayContainerState> {
  private readonly backgroundMusic: React.RefObject<HTMLAudioElement>;
  private readonly snowMusic: React.RefObject<HTMLAudioElement>;

  public constructor(props: GamePlayContainerProps) {
    super(props);
    this.backgroundMusic = React.createRef();
    this.snowMusic = React.createRef();
    this.state = {
      scaredTouristListener: null
    };
  }

  public componentDidMount(): void {
    window.addEventListener('keydown', this.backgroundMusicStart);
    const scaredTouristListener = this.scaredTouristListener();
    this.setState({ scaredTouristListener: scaredTouristListener });
  }

  public componentDidUpdate(): void {
    if (this.props.timeFinished) {
      this.backgroundMusic.current?.pause();
      this.snowMusic.current?.pause();
    }
  }

  public componentWillUnmount(): void {
    this.state.scaredTouristListener && window.clearInterval(this.state.scaredTouristListener);
  }

  public render(): React.ReactElement {
    return (
      <>
        <audio 
          src={'../backgroundMusic.mp3'} 
          loop={true} 
          ref={this.backgroundMusic}
        />
        <audio 
          src={'../snowMusic.mp3'} 
          loop={true} 
          ref={this.snowMusic}
        />
        {this.props.timeFinished === null ? <GamePlayScreen canvasContext={this.props.canvasContext} canvas={this.props.canvas}/> : <GameStatistics canvasContext={this.props.canvasContext} canvas={this.props.canvas}/> }
      </>
    )
  }

  private backgroundMusicStart = (e: KeyboardEvent) => {
    if ( e.key === 'ArrowUp' ) {
      if ( backgroundMusicOn ) {
        this.backgroundMusic.current && this.props.setBackgroundMusicRef(this.backgroundMusic.current);
        this.snowMusic.current && this.props.setSnowMusicRef(this.snowMusic.current);
        this.backgroundMusic.current?.play();
      }
      window.removeEventListener('keydown', this.backgroundMusicStart);
    }
  }

  private scaredTouristListener = () => {
    microphoneRunner(loudnessSpookLevel);
    return window.setInterval(() => {
      const readyForYelling = (this.props.time/1000) - this.props.timeOfYell > loudnessRechargeInSeconds
      if (loudEnough && readyForYelling ) {
        this.props.recordTimeOfYell(this.props.time/1000)
        for ( let tourist of this.props.touristRoaster ) {
          // @ts-ignore - fix imperative access
          tourist.spookedRunAway();
        }
      }
    }, 100)
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    timeFinished: state.timeFinished,
    touristRoaster: state.touristRoaster,
    time: state.time,
    timeOfYell: state.timeOfYell
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setBackgroundMusicRef: (musicRef: HTMLAudioElement) => dispatch(Actions.setBackgroundMusicRef(musicRef)),
    setSnowMusicRef: (musicRef: HTMLAudioElement) => dispatch(Actions.setSnowMusicRef(musicRef)),
    recordTimeOfYell: (time: number) => dispatch(Actions.recordTimeOfYell(time))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GamePlayContainer)
