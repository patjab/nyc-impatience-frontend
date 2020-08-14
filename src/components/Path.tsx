import * as React from 'react'
import { connect } from 'react-redux'

import { initializeBrickList } from '../actions'
import { nySkyline } from '../images'
import { depthMultiplier, horizonLine, numOfBricksInARow, brickColor, brickBorderColor,
  sideAreaColor, statusBarHeight, canvasWidth, canvasHeight, skyColor } from '../setupData'
import { BrickUtils, Row } from '../utils/BrickUtils'

type PathProps = any;
type PathState = any;

class Path extends React.Component<PathProps, PathState> {
  private readonly initialBrickSpacingBetweenRows: number;
  private readonly skylineWidth: number;
  private readonly skylineHeight: number;
  private readonly skylineStartX: number;
  private readonly skylineStartY: number;
  private readonly nySkyline: React.RefObject<HTMLImageElement>;

  private brickSpacingBetweenRows: number;
  private cfBricksList: Row[];

  public constructor(props: PathProps) {
    super(props);

    this.initialBrickSpacingBetweenRows = 1;
    this.skylineWidth = canvasWidth + 80;
    this.skylineHeight = 483;
    this.skylineStartX = -55;
    this.skylineStartY = 20;
    this.nySkyline = React.createRef();

    this.brickSpacingBetweenRows = 1;
    this.cfBricksList = [];
  }

  // public componentDidMount(): void {
  //   if (this.nySkyline.current) {
  //     this.nySkyline.current.onload
  //     this.nySkyline.current.onload = () => {
  //       const ctx = this.props.canvas.getContext("2d")
  //       ctx.drawImage(this.refs.nySkyline, this.skylineStartX, this.skylineStartY, this.skylineWidth, this.skylineHeight)
  //       this.drawStartInstructions(ctx)
  //     }
  //   }
  // }

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
    if ((this.props.centersOfBricks && this.props.centersOfBricks.length === 0) || prevProps.movement !== this.props.movement) {
      console.log('INIT BRICKS')
      this.props.initializeBrickList(this.cfBricksList)
    }
    if (!this.props.gameStarted) {
      this.drawStartInstructions(ctx)
    }
  }

  render() {
    const ctx = this.props.canvas && this.props.canvas.getContext("2d");
    if (ctx) {
      this.drawPathBackground(ctx)
      this.makeBricks(ctx)
      this.makeSideStructures(ctx)
      this.drawLeftPathBorder(ctx)
      this.drawSky(ctx)
      this.drawBicycleLane(ctx)
    }
    return (
      <img 
        src={nySkyline} 
        className={'hidden'}
        alt={'nySkyline'}
        ref={this.nySkyline}
      />
    );
  }

  private determineSideWeatherColors = () => {
    if ( this.props.weather === "SUNNY" ) {
      return sideAreaColor
    } else if ( this.props.weather === "SNOWING" ) {
      return '#FFFFFF'
    }
  }

  private drawPathBackground = (ctx: any) => {
    ctx.beginPath()
    ctx.rect(0, horizonLine, canvasWidth, canvasHeight)
    ctx.fillStyle = brickColor
    ctx.fill()
    ctx.beginPath()
  }

  private findAngle = () => {
    const lengthOfGroundTriangle = canvasHeight - horizonLine
    const widthOfGroundTriangle = canvasWidth/2

    const sideOfPath = Math.sqrt(Math.pow(lengthOfGroundTriangle, 2) + Math.pow(widthOfGroundTriangle, 2))
    const numerator = (2 * Math.pow(sideOfPath, 2)) - Math.pow(canvasWidth, 2)
    const denominator = (2 * Math.pow(sideOfPath, 2))

    return Math.acos(numerator/denominator)
  }

  private getRows = () => {
    const rowsWithBrickBorders = []
    for ( let row = horizonLine; row <= canvasHeight; row += this.brickSpacingBetweenRows ) {
      const distanceFromHorizon = row - horizonLine
      const percentageOfBrick = (this.props.movement * this.props.movementPerBrick) % 2
      const absoluteChunkOfBrick = this.brickSpacingBetweenRows * percentageOfBrick
      const rowWithBorderBrick = row + (absoluteChunkOfBrick)
      rowsWithBrickBorders.push(rowWithBorderBrick)
      this.brickSpacingBetweenRows = this.brickSpacingBetweenRows + (depthMultiplier*distanceFromHorizon)
    }
    rowsWithBrickBorders.push(canvasHeight)
    rowsWithBrickBorders.sort((a,b)=>a-b)
    return rowsWithBrickBorders
  }

  private makeBricks = (ctx: any) => {
    let bricksList: any = BrickUtils.makeBricks(
      this.getRows(),
      horizonLine,
      this.findAngle(),
      canvasWidth,
      true,
      numOfBricksInARow,
      brickBorderColor,
      ctx
    );
    
    // FIX IMPURE
    this.brickSpacingBetweenRows = this.initialBrickSpacingBetweenRows
    this.cfBricksList = bricksList
    return bricksList;
  }

  private makeSideStructures = (ctx: any) => {
    const centralX = canvasWidth/2

    ctx.fillStyle = this.determineSideWeatherColors()
    ctx.beginPath()
    ctx.moveTo(0, canvasHeight)
    ctx.lineTo(centralX, horizonLine)
    ctx.lineTo(0, horizonLine)
    ctx.closePath()
    ctx.stroke()
    ctx.fill()
    // Added
    ctx.closePath()

    ctx.fillStyle = this.determineSideWeatherColors()
    ctx.beginPath()
    ctx.moveTo(canvasWidth, canvasHeight)
    ctx.lineTo(centralX, horizonLine)
    ctx.lineTo(canvasWidth, horizonLine)
    ctx.lineTo(canvasWidth, canvasHeight)
    ctx.closePath()
    ctx.stroke()
    ctx.fill()
  }

  private drawSky(ctx: any) {
    ctx.rect(0, statusBarHeight, canvasWidth, horizonLine - statusBarHeight)
    ctx.fillStyle = skyColor
    ctx.fill()
  }

  private drawBicycleLane(ctx: any) {
    ctx.beginPath()
    ctx.moveTo(canvasWidth/2, horizonLine)
    ctx.lineTo(canvasWidth/2 - 10, horizonLine)
    ctx.lineTo(0, canvasHeight)
    ctx.lineTo(canvasWidth/10, canvasHeight)
    ctx.closePath()
    ctx.fillStyle = this.determineSideWeatherColors()
    ctx.fill()
    // Added
    ctx.closePath()
  }

  private drawLeftPathBorder = (ctx: any) => {
    ctx.beginPath()
    ctx.moveTo(canvasWidth/10, canvasHeight)
    ctx.lineTo(canvasWidth/2, horizonLine)
    ctx.strokeStyle = brickBorderColor
    ctx.stroke()
    // Added
    ctx.closePath()
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
    movement: state.movement,
    centersOfBricks: state.centersOfBricks,
    movementPerBrick: state.movementPerBrick,
    pathUpdater: state.pathUpdater,
    gameStarted: state.gameStarted,
    weather: state.weather
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    initializeBrickList: (brickList: any) => dispatch(initializeBrickList(brickList))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Path)
