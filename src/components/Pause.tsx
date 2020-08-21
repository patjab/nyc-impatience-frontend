import * as React from 'react';
import {canvasWidth, canvasHeight} from '../setupData'
import {ScreenProps} from '../App';

interface PauseProps extends ScreenProps {};

class Pause extends React.PureComponent<PauseProps> {
  public constructor(props: PauseProps) {
    super(props);
  }
  
  public drawPauseDialog() {
    const ctx = this.props.canvasContext;
    ctx.beginPath()
    ctx.fillStyle = 'maroon'
    ctx.fillRect(50, canvasHeight/2 - 75 - 200, canvasWidth - 100, 150)
    ctx.closePath()

    ctx.textAlign = 'center'
    ctx.fillStyle = 'white'
    ctx.font = "50px Geneva"

    ctx.fillText(`PAUSED`, canvasWidth/2, canvasHeight/2 - 200)

    ctx.textAlign = 'center'
    ctx.fillStyle = 'white'
    ctx.font = "20px Geneva"

    ctx.fillText(`Press [q] to exit`, canvasWidth/2, canvasHeight/2 - 200 + 40);
  }
  

  public render(): React.ReactElement {
    this.drawPauseDialog();
    return (<></>);
  }
}

export default Pause;
