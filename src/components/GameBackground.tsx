import * as React from 'react'
import {connect} from 'react-redux'

import {nySkyline} from '../images'
import {horizonLine, statusBarHeight, canvasWidth, canvasHeight, skyColor} from '../setupData'
import GamePath from './GamePath'
import Map from './Map';

export enum Weather {
  SUNNY = 'SUNNY',
  SNOWING = 'SNOWING'
}

interface PathProps {
  canvas: any;
  gameStarted: any;
  weather: Weather
}

class GameBackground extends React.Component<PathProps> {
  private readonly skylineWidth: number;
  private readonly skylineHeight: number;
  private readonly skylineStartX: number;
  private readonly skylineStartY: number;
  private readonly nySkyline: React.RefObject<HTMLImageElement>;


  public constructor(props: PathProps) {
    super(props);

    this.skylineWidth = canvasWidth + 80;
    this.skylineHeight = 483;
    this.skylineStartX = -55;
    this.skylineStartY = 20;
    this.nySkyline = React.createRef();
  }

  public componentDidMount(): void {
    if (this.nySkyline.current) {
      this.nySkyline.current.onload = () => {
        const ctx = this.props.canvas.getContext("2d")
        ctx.drawImage(this.nySkyline.current, this.skylineStartX, this.skylineStartY, this.skylineWidth, this.skylineHeight)
        this.drawStartInstructions(ctx)
      }
    }
  }

  public componentDidUpdate(prevProps: PathProps): void {
    const nySkyline = this.nySkyline.current;
    const ctx = this.props.canvas.getContext('2d');
    if (nySkyline && nySkyline.complete) {
      ctx.drawImage(nySkyline, this.skylineStartX, this.skylineStartY, this.skylineWidth, this.skylineHeight)
      this.drawStartInstructions(ctx)
    }

    if (this.props.canvas && nySkyline) {
      ctx.drawImage(nySkyline, this.skylineStartX, this.skylineStartY, this.skylineWidth, this.skylineHeight)
    }

    if (!this.props.gameStarted) {
      this.drawStartInstructions(ctx)
    }
  }

  public render(): React.ReactElement {
    const ctx = this.props.canvas && this.props.canvas.getContext("2d");
    if (ctx) {
      this.drawSky(ctx)
    }
    return (
      <>
        <img 
          src={nySkyline} 
          className={'hidden'}
          alt={'nySkyline'}
          ref={this.nySkyline}
        />
        <GamePath/>
        { this.props.gameStarted  ? <Map /> : null }

      </>
    );
  }

  private drawSky(ctx: any) {
    ctx.rect(0, statusBarHeight, canvasWidth, horizonLine - statusBarHeight)
    ctx.fillStyle = skyColor
    ctx.fill()
  }

  private drawStartInstructions = (ctx: any) => {
    const mapMargins = 0
    const widthOfMap = canvasWidth - (mapMargins*2)
    const heightOfMap = 150
    ctx.beginPath()
    ctx.rect(mapMargins, canvasHeight - mapMargins - heightOfMap, widthOfMap, heightOfMap)
    ctx.fillStyle = "#000000"
    ctx.fill()
    ctx.closePath()

    ctx.font = "36px Geneva"
    ctx.fillStyle = "white"
    ctx.fillText('Press UP arrow to start', canvasWidth/2, canvasHeight-75)
    ctx.textAlign = 'center'
  }

}

const mapStateToProps = (state: any) => {
  return {
    canvas: state.canvas,
    gameStarted: state.gameStarted,
    weather: state.weather
  }
}

export default connect(mapStateToProps)(GameBackground);
