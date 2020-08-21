import * as React from 'react';
import {connect} from 'react-redux';
import {canvasWidth, statusBarHeight, initialPatience} from '../setupData';
import {ScreenProps} from '../App';
import {AppState} from '../store/initialState';

interface PatienceProps extends ScreenProps {
  patience: number;
  isPaused: boolean;
}

class Patience extends React.PureComponent<PatienceProps> {
  private readonly lowPatienceSound: React.RefObject<HTMLAudioElement>;

  public constructor(props: PatienceProps) {
    super(props);
    this.lowPatienceSound = React.createRef<HTMLAudioElement>();
  }

  public componentDidMount(): void {
    this.drawLivesMeter(this.props.canvasContext);
  }

  public componentDidUpdate(): void {
    this.drawLivesMeter(this.props.canvasContext);
  }

  public render(): React.ReactElement {
    return (
      <audio 
        src={'../lowPatience.wav'}
        loop={true} 
        ref={this.lowPatienceSound}
      />
    );
  }

  private drawLivesMeter = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(canvasWidth*0.30, 0, canvasWidth*0.40, statusBarHeight);
    ctx.fillStyle = 'black';
    ctx.fillRect(canvasWidth*0.30, 0, canvasWidth*0.40, statusBarHeight);

    ctx.font = "20px Geneva";
    ctx.fillStyle = "white";
    ctx.textAlign = 'center';
    ctx.fillText(`Patience`, canvasWidth/2, 30);

    ctx.beginPath();
    ctx.fillStyle = "grey";
    ctx.fillRect(250, 40, initialPatience, 30);
    ctx.closePath();

    ctx.beginPath();

    if (this.lowPatienceSound.current) {
      if (this.formatPercentage() > 50) {
        ctx.fillStyle = "green";
      } else if (this.formatPercentage() <= 50 && this.formatPercentage() >= 25) {
        ctx.fillStyle = "yellow";
        this.lowPatienceSound.current.pause();
      } else {
        ctx.fillStyle = "red";
        this.lowPatienceSound.current.play();
  
        if ( this.props.isPaused ) {
          this.lowPatienceSound.current.pause();
        } 
      }
    }
    
    ctx.fillRect(250, 40, this.props.patience, 30);
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fillText(`${this.formatPercentage()}%`, canvasWidth/2, 62);
  }

  private formatPercentage = (): number => {
    if (Math.round(this.props.patience * 10000/initialPatience) / 100 > 99.1) {
      return 100
    } else if (Math.round(this.props.patience * 10000/initialPatience) / 100 < 0) {
      return 0
    } else {
      return Math.round(this.props.patience * 10000/initialPatience) / 100
    }
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    patience: state.patience,
    isPaused: state.isPaused
  }
};

export default connect(mapStateToProps)(Patience);