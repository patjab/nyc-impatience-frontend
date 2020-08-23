import * as React from 'react';
import {connect} from 'react-redux';
import {backgroundMusicOn} from '../setupData';
import {Actions} from '../store/Actions';
import GamePlayScreen from './GamePlayScreen';
import GameStatistics from './GameStatistics';
import {AppState} from '../store/initialState';
import {Dispatch} from 'redux';
import {ScreenProps} from '../App';

interface GamePlayContainerProps extends ScreenProps {
  timeFinished: number | null;
  setBackgroundMusicRef: (musicRef: HTMLAudioElement) => void;
  setSnowMusicRef: (musicRef: HTMLAudioElement) => void;
}

class GamePlayContainer extends React.PureComponent<GamePlayContainerProps> {
  private readonly backgroundMusic: React.RefObject<HTMLAudioElement>;
  private readonly snowMusic: React.RefObject<HTMLAudioElement>;

  public constructor(props: GamePlayContainerProps) {
    super(props);
    this.backgroundMusic = React.createRef();
    this.snowMusic = React.createRef();
  }

  public componentDidMount(): void {
    window.addEventListener('keydown', this.backgroundMusicStart);
  }

  public componentDidUpdate(): void {
    if (this.props.timeFinished) {
      this.backgroundMusic.current?.pause();
      this.snowMusic.current?.pause();
    }
  }

  public render(): React.ReactElement {
    const Screen = this.props.timeFinished === null ? GamePlayScreen : GameStatistics;
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
        <Screen canvasContext={this.props.canvasContext} canvas={this.props.canvas}/>
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

}

const mapStateToProps = (state: AppState) => {
  return {
    timeFinished: state.timeFinished
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setBackgroundMusicRef: (musicRef: HTMLAudioElement) => dispatch(Actions.setBackgroundMusicRef(musicRef)),
    setSnowMusicRef: (musicRef: HTMLAudioElement) => dispatch(Actions.setSnowMusicRef(musicRef))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GamePlayContainer);