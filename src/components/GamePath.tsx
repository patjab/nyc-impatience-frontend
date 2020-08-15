import * as React from 'react';
import { connect } from 'react-redux';
import { horizonLine, canvasWidth, canvasHeight, brickColor, brickBorderColor, numOfBricksInARow, depthMultiplier, movementPerBrick, brickSpacingBetweenRows, touristDensity } from '../setupData';
import { BrickUtils, Row } from '../utils/BrickUtils';
import { Weather } from './GameBackground';
import Tourist from './Tourist';

interface GamePathProps {
    canvas: HTMLCanvasElement;
    weather: Weather;
    movement: number;
    garbageOfTourists: number[];
    stage: number;
}

class GamePath extends React.PureComponent<GamePathProps> {
    public constructor(props: GamePathProps) {
        super(props);
    }

    public render(): JSX.Element | JSX.Element[] {
        const ctx = this.props.canvas && this.props.canvas.getContext("2d");
        if (ctx) {
            this.drawPathBackground(ctx)
            const bricksList: Row[] = this.makeBricks(ctx)
            this.makeSideStructures(ctx, this.props.weather)
            this.drawLeftPathBorder(ctx)
            this.drawBicycleLane(ctx, this.props.weather)
            return this.renderTourists(touristDensity, bricksList);

        } else {
            return (<></>);
        }
    }

    private renderTourists = (numberOfTourists: number, bricksList: Row[]): JSX.Element[] => {

        const totalNumOfTourists: number = numberOfTourists + this.props.stage;

        
        let tourists = []
          for ( let i = 0; i < totalNumOfTourists; i++ ) {
            if ( !this.props.garbageOfTourists.includes(i) ) {
              tourists.push(<Tourist key={i} id={i} brickPositions={bricksList} />)
            }
            else {
              numberOfTourists++
            }
          }
    
        return tourists;
    }

    // BEFORE THIS
    private drawPathBackground = (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath()
        ctx.rect(0, horizonLine, canvasWidth, canvasHeight)
        ctx.fillStyle = brickColor
        ctx.fill()
        ctx.beginPath()
    }

    private makeSideStructures = (ctx: any, weather: Weather) => {
        const centralX = canvasWidth/2
    
        ctx.fillStyle = BrickUtils.determineSideWeatherColors(weather)
        ctx.beginPath()
        ctx.moveTo(0, canvasHeight)
        ctx.lineTo(centralX, horizonLine)
        ctx.lineTo(0, horizonLine)
        ctx.closePath()
        ctx.stroke()
        ctx.fill()
        ctx.closePath()
    
        ctx.fillStyle = BrickUtils.determineSideWeatherColors(weather)
        ctx.beginPath()
        ctx.moveTo(canvasWidth, canvasHeight)
        ctx.lineTo(centralX, horizonLine)
        ctx.lineTo(canvasWidth, horizonLine)
        ctx.lineTo(canvasWidth, canvasHeight)
        ctx.closePath()
        ctx.stroke()
        ctx.fill()
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

    private drawBicycleLane(ctx: any, weather: Weather) {
        ctx.beginPath()
        ctx.moveTo(canvasWidth/2, horizonLine)
        ctx.lineTo(canvasWidth/2 - 10, horizonLine)
        ctx.lineTo(0, canvasHeight)
        ctx.lineTo(canvasWidth/10, canvasHeight)
        ctx.closePath()
        ctx.fillStyle = BrickUtils.determineSideWeatherColors(weather)
        ctx.fill()
        // Added
        ctx.closePath()
    }

    private makeBricks = (ctx: any): Row[] => {
        return BrickUtils.makeBricks(
          horizonLine,
          canvasWidth,
          true,
          numOfBricksInARow,
          brickBorderColor,
          ctx,
          brickSpacingBetweenRows,
          this.props.movement,
          movementPerBrick,
          depthMultiplier
        );
    }
    
}


const mapStateToProps = (state: any) => {
    return {
        canvas: state.canvas,
        weather: state.weather,
        movement: state.movement,
        garbageOfTourists: state.garbageOfTourists,
        stage: state.stage
    }
}

export default connect(mapStateToProps)(GamePath);