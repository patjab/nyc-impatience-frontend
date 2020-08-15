import * as React from 'react';
import { connect } from 'react-redux';
import { horizonLine, canvasWidth, canvasHeight, brickColor, brickBorderColor } from '../setupData';
import { BrickUtils } from '../utils/BrickUtils';
import { Weather } from './GameBackground';

interface GamePathProps {
    canvas: HTMLCanvasElement;
    weather: Weather;
}

class GamePath extends React.PureComponent<GamePathProps> {
    public constructor(props: GamePathProps) {
        super(props);
    }

    public render(): React.ReactElement {
        console.log('RENDER GamePath')
        const ctx = this.props.canvas && this.props.canvas.getContext("2d");
        if (ctx) {
            this.drawPathBackground(ctx)
            // this.makeBricks(ctx)
            this.makeSideStructures(ctx, this.props.weather)
            this.drawLeftPathBorder(ctx)
            this.drawBicycleLane(ctx, this.props.weather)
        }
        return (<div></div>);
    }

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
    
}


const mapStateToProps = (state: any) => {
    return {
        canvas: state.canvas,
        weather: state.weather
    }
}
  
export default connect(mapStateToProps)(GamePath);