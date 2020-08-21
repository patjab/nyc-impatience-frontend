import * as React from 'react';
import {connect} from 'react-redux';
import {canvasHeight, canvasWidth, numberOfHighScoresToDisplay} from '../setupData';
import {Actions} from '../store/Actions';
import {Adapter, ScoreResponse} from '../adapter/Adapter';
import { ScreenProps } from '../App';
import { Dispatch } from 'redux';
import { CanvasScreen } from '../utils/CanvasScreens';

interface HighScoresProps extends ScreenProps {
  changeCurrentScreen: (screen: CanvasScreen) => void;
  resetAllState: () => void;
}

interface HighScoresState {
  topScores: ScoreResponse[] | null;
}

class HighScores extends React.PureComponent<HighScoresProps, HighScoresState> {
  public constructor(props: HighScoresProps) {
    super(props);
    this.state = {
      topScores: null
    };
  }

  public componentDidMount(): void {
    const ctx = this.props.canvasContext;
    this.clearScreen(ctx);
    const loadingImg = new Image();
    loadingImg.src = '../loading.png';
    loadingImg.onload = this.onLoadHighScores(loadingImg, ctx);
  }

  public componentDidUpdate(): void {
    const ctx = this.props.canvasContext;
    this.clearScreen(ctx);
    this.drawTopScores(ctx);
  }

  public componentWillUnmount(): void {
    window.removeEventListener('keydown', this.switchToMainScreen)
  }

  public render(): React.ReactElement {
    return (<></>);
  }

  private switchToMainScreen = (e: KeyboardEvent) => {
    if (e.keyCode === 27) {
      this.props.changeCurrentScreen(CanvasScreen.START);
      this.props.resetAllState();
    }
  }

  private onLoadHighScores = (loadingImg: HTMLImageElement, ctx: CanvasRenderingContext2D) => () => {
    ctx.drawImage(loadingImg, (canvasWidth/2) - (680/2), canvasHeight/2 - 170, 680, 170);

    setTimeout(() => {
      if (!this.state.topScores) {
        ctx.font = "24px Geneva";
        ctx.fillStyle = "white";
        ctx.textAlign = 'right';
        ctx.fillText("[ESC] for Main Screen", canvasWidth-100, canvasHeight-100);
      }
    }, 5000);

    window.addEventListener('keydown', this.switchToMainScreen);

    Adapter.getHighScores()
      .then((allScores: ScoreResponse[]) => {
        const sortedScores = allScores.sort((score1, score2) => score2.distance - score1.distance);
        const topScores = sortedScores.slice(0, numberOfHighScoresToDisplay);
        this.setState({ topScores })
      });
  }

  private clearScreen = (ctx: CanvasRenderingContext2D): void => {
    ctx.beginPath();
    ctx.rect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.closePath();
  }

  private drawTopScores = (ctx: CanvasRenderingContext2D): void => {
    if ( this.state.topScores ) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '50px Geneva';
      ctx.textAlign = 'center';

      let yCursor = 100;

      ctx.fillText("HIGH SCORES", canvasWidth/2, yCursor);
      yCursor += 50;
      yCursor += 12;

      ctx.textAlign = 'left';

      ctx.font = '20px Geneva';
      ctx.fillText(`Total`, 320, yCursor);
      ctx.fillText(`Distance`, 450, yCursor);
      ctx.fillText(`Minutes`, 550, yCursor);
      ctx.fillText(`Key`, 650, yCursor);
      yCursor += 24;
      ctx.fillText(`Distance`, 320, yCursor);
      ctx.fillText(`Streak`, 450, yCursor);
      ctx.fillText(`Lasted`, 550, yCursor);
      ctx.fillText(`Changes`, 650, yCursor);
      yCursor += 12 + 36;

      ctx.font = '30px Geneva';

      this.state.topScores.forEach((scoreData: ScoreResponse, index: number) => {
        ctx.fillText(`${index + 1}. ${scoreData.name}`, 40, yCursor);
        ctx.fillText(`${scoreData.distance}`, 320, yCursor);
        ctx.fillText(`${scoreData.longest_streak}`, 450, yCursor);
        ctx.fillText(`${Math.round(((scoreData.time_lasted/100)/60)*100)/100}`, 550, yCursor);
        ctx.fillText(`${scoreData.direction_changes}`, 650, yCursor);
        yCursor += 12 + 36;
      });

      ctx.font = "24px Geneva";
      ctx.fillStyle = "white";
      ctx.textAlign = 'right';
      ctx.fillText("[ESC] for Main Screen", canvasWidth-100, canvasHeight-100);
    }
  }

}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    changeCurrentScreen: (screen: CanvasScreen) => dispatch(Actions.changeCurrentScreen(screen)),
    resetAllState: () => dispatch(Actions.resetAllState())
  }
}

export default connect(null, mapDispatchToProps)(HighScores);