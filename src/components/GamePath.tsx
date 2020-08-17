import * as React from 'react';
import {connect} from 'react-redux';
import {horizonLine, canvasWidth, canvasHeight, brickColor, brickBorderColor, numOfBricksInARow, 
    depthMultiplier, movementPerBrick, brickSpacingBetweenRows, touristDensity, heightOfMap} from '../setupData';
import {BrickUtils, Row} from '../utils/BrickUtils';
import Tourist from './Tourist';
import {Position} from '../utils/BrickUtils';
import {AppState} from '../store/initialState';
import {Weather} from '../utils/Weather';

interface GamePathProps {
    canvas: HTMLCanvasElement | null;
    weather: Weather;
    movement: number;
    stage: number;
    touristGoneCounter: number;
}

class GamePath extends React.Component<GamePathProps> {
    public constructor(props: GamePathProps) {
        super(props);
    }

    public shouldComponentUpdate(prevProps: GamePathProps): boolean {
      return prevProps.touristGoneCounter === this.props.touristGoneCounter;
    }

    public render(): JSX.Element | JSX.Element[] {

        const ctx = this.props.canvas && this.props.canvas.getContext("2d");
        if (ctx) {

            const brickMatrix: Row[] = BrickUtils.getBrickMatrix(
                horizonLine,
                canvasWidth,
                numOfBricksInARow,
                brickSpacingBetweenRows,
                this.props.movement,
                movementPerBrick,
                depthMultiplier
            );

            this.drawPathBackground(ctx);
            this.drawBrickMatrix(ctx, brickMatrix);
            this.drawSideStructures(ctx, this.props.weather);
            this.drawLeftPathBorder(ctx);
            this.drawBicycleLane(ctx, this.props.weather);
            return this.renderTourists(touristDensity, brickMatrix);

        } else {
            return (<></>);
        }
    }

    private renderTourists = (numberOfTourists: number, bricksList: Row[]): JSX.Element[] => {        
        let tourists = [];
        for ( let i = this.props.touristGoneCounter; i < (numberOfTourists + this.props.stage + this.props.touristGoneCounter); i++ ) {
            tourists.push(<Tourist key={i} id={i} brickPositions={bricksList} />);
        }
        return tourists;
    }

    private drawPathBackground = (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        ctx.rect(0, horizonLine, canvasWidth, canvasHeight - heightOfMap);
        ctx.fillStyle = brickColor;
        ctx.fill();
        ctx.beginPath();
    }

    private drawSideStructures = (ctx: CanvasRenderingContext2D, weather: Weather) => {
        const centralX = canvasWidth/2;
    
        ctx.fillStyle = BrickUtils.determineSideWeatherColors(weather);
        ctx.beginPath();
        ctx.moveTo(0, canvasHeight);
        ctx.lineTo(centralX, horizonLine);
        ctx.lineTo(0, horizonLine);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    
        ctx.fillStyle = BrickUtils.determineSideWeatherColors(weather);
        ctx.beginPath();
        ctx.moveTo(canvasWidth, canvasHeight);
        ctx.lineTo(centralX, horizonLine);
        ctx.lineTo(canvasWidth, horizonLine);
        ctx.lineTo(canvasWidth, canvasHeight);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }

    private drawLeftPathBorder = (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        ctx.moveTo(canvasWidth/10, canvasHeight);
        ctx.lineTo(canvasWidth/2, horizonLine);
        ctx.strokeStyle = brickBorderColor;
        ctx.stroke();
        ctx.closePath();
    }

    private drawBicycleLane(ctx: CanvasRenderingContext2D, weather: Weather) {
        ctx.beginPath();
        ctx.moveTo(canvasWidth/2, horizonLine);
        ctx.lineTo(canvasWidth/2 - 10, horizonLine);
        ctx.lineTo(0, canvasHeight);
        ctx.lineTo(canvasWidth/10, canvasHeight);
        ctx.closePath();
        ctx.fillStyle = BrickUtils.determineSideWeatherColors(weather);
        ctx.fill();
        ctx.closePath();
    }

    private drawBrickMatrix = (ctx: CanvasRenderingContext2D, brickMatrix: Row[]): void => {
        brickMatrix.forEach((row: Row, rowIndex: number) => {
            this.drawHorizontalRow(ctx, row[0].y, canvasWidth);
            this.drawBrickVerticals(ctx, brickMatrix[rowIndex-1] || [], row, rowIndex % 2 === 0, brickBorderColor);
        });
    }

    private drawHorizontalRow(ctx: CanvasRenderingContext2D, row: number, canvasWidth: number) {
        ctx.beginPath()
        ctx.moveTo(0, row)
        ctx.lineTo(canvasWidth, row)
        ctx.stroke()
    };

    private drawBrickVerticals( ctx: CanvasRenderingContext2D, 
                                previousPoints: Row, 
                                currentPoints: Row, 
                                shouldAlternateOdd: boolean, 
                                brickBorderColor: string ): void {
        previousPoints.forEach((previousPoint: Position, i: number) => {
            if ( (shouldAlternateOdd && i % 2 === 0) || (!shouldAlternateOdd && i % 2 === 1 )  ) {
                ctx.beginPath();
                ctx.moveTo(previousPoint.x, previousPoint.y);
                ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
                ctx.strokeStyle = brickBorderColor;
                ctx.stroke();
            }
        });
    }
}

const mapStateToProps = (state: AppState) => {
    return {
        canvas: state.canvas,
        weather: state.weather,
        movement: state.movement,
        stage: state.stage,
        touristGoneCounter: state.touristGoneCounter
    }
}

export default connect(mapStateToProps)(GamePath);