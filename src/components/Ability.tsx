import * as React from 'react';
import {connect} from 'react-redux';
import {canvasWidth, statusBarHeight, loudnessRechargeInSeconds, maximumSecondsOfRecharge, walking} from '../setupData';
import {activeMegaphone, inactiveMegaphone, activeRunning, inactiveRunning, redRunning} from '../images';
import {AppState} from '../store/initialState';

interface AbilityProps {
  canvas: HTMLCanvasElement | null;
  time: number;
  timeOfYell: number;
  timeOfRun: number;
  speed: number;
}

class Ability extends React.PureComponent<AbilityProps> {
  public constructor(props: AbilityProps) {
    super(props);
  }

  public componentDidMount(): void {
    const ctx = this.props.canvas?.getContext('2d');
    if (ctx) {
      this.clearAbilityBackground(ctx);
    }
  }

  public componentDidUpdate(): void {
    const ctx = this.props.canvas?.getContext('2d');

    if (ctx) {
      const timePassedYell = Math.round((this.props.time/1000) - this.props.timeOfYell);
      const timePassedRun = Math.round((this.props.time/1000) - this.props.timeOfRun);
  
      const readyForYelling = timePassedYell > loudnessRechargeInSeconds;
      const readyForRunning = timePassedRun >= maximumSecondsOfRecharge;
  
      const shoutIcon = new Image();
      shoutIcon.src = readyForYelling ? activeMegaphone : inactiveMegaphone;
  
      const runningIcon = new Image();
      runningIcon.src = readyForRunning ? activeRunning : ( this.props.speed === 2 * walking ? redRunning : inactiveRunning );
  
      shoutIcon.onload = () => {
        runningIcon.onload = () => {
          this.clearAbilityBackground(ctx);
          this.drawUpdatedImagesAndTimers(ctx, shoutIcon, timePassedYell, readyForYelling, runningIcon, timePassedRun, readyForRunning);
        }
      }
    }
  }

  public render(): React.ReactElement {
    return (<></>);
  }

  private clearAbilityBackground = (ctx: CanvasRenderingContext2D): void => {
    ctx.clearRect(0, 0, canvasWidth*0.30, statusBarHeight);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth*0.30, statusBarHeight);
  }

  private drawUpdatedImagesAndTimers = (ctx: CanvasRenderingContext2D, 
                                        shoutIcon: CanvasImageSource, 
                                        timePassedYell: number, 
                                        readyForYelling: boolean, 
                                        runningIcon: CanvasImageSource, 
                                        timePassedRun: number, 
                                        readyForRunning: boolean ): void => {
    ctx.textAlign = 'center';
    ctx.font = '20px Geneva';
    ctx.fillStyle = 'white';
    ctx.fillText(`Abilities`, (canvasWidth*0.30)/2, 30);

    ctx.drawImage(shoutIcon, (canvasWidth*0.30)*0.28, 35, 40, 40);
    if ( !readyForYelling && timePassedYell > 0) {
      ctx.beginPath();
      ctx.arc((canvasWidth*0.30)*0.42, 70, 15, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
      ctx.closePath();

      ctx.font = '20px Impact';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.fillText(`${loudnessRechargeInSeconds - timePassedYell}`, (canvasWidth*0.30)*0.42, 78);
    }

    ctx.drawImage(runningIcon, (canvasWidth*0.30)*0.53, 35, 40, 40);

    if ( !readyForRunning && this.props.speed === walking ) {
      ctx.beginPath();
      ctx.arc((canvasWidth*0.30)*0.70, 70, 15, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
      ctx.closePath();

      ctx.font = '20px Impact';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.fillText(`${maximumSecondsOfRecharge - timePassedRun}`, (canvasWidth*0.30)*0.70, 78);
    }
  }
}

const mapStateToProps = (state: AppState) => ({
  canvas: state.canvas,
  time: state.time,
  timeOfYell: state.timeOfYell,
  timeOfRun: state.timeOfRun,
  speed: state.speed,
  movement: state.movement
});

export default connect(mapStateToProps)(Ability);