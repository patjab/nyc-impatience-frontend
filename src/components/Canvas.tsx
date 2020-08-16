import * as React from 'react'
import {connect} from 'react-redux'
import {setThisCanvas} from '../actions'
import {canvasWidth, canvasHeight} from '../setupData'
import GamePlayContainer from './GamePlayContainer'
import {Dispatch} from 'redux'

interface CanvasProps {
  bumpingShake: boolean;
  setCanvas: (canvasRef: HTMLCanvasElement | null) => void;
}

class Canvas extends React.PureComponent<CanvasProps> {

  private readonly canvasRef: React.RefObject<HTMLCanvasElement>;

  public constructor(props: CanvasProps) {
    super(props);
    this.canvasRef = React.createRef<HTMLCanvasElement>();
  }

  public componentDidMount(): void {
    this.props.setCanvas(this.canvasRef.current);
  }

  public render(): React.ReactElement {
    return (
      <>
        <canvas 
          width={canvasWidth} 
          height={canvasHeight} 
          ref={this.canvasRef} 
          id={'playArea'}
          className={this.props.bumpingShake ? 'bumpingShake' : ''}
        />
        <GamePlayContainer />
      </>
    )
  }
}

const mapStateToProps = (state: any) => {
  return {
    bumpingShake: state.bumpingShake
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setCanvas: (canvasRef: HTMLCanvasElement | null) => dispatch(setThisCanvas(canvasRef))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Canvas);