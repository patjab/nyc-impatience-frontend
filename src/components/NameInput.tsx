import * as React from 'react';
import {connect} from 'react-redux';
import {canvasWidth} from '../setupData';
import {Actions} from '../store/Actions';
import {ScreenProps} from '../App';
import {Dispatch} from 'redux';
import {AppState} from '../store/initialState';

interface NameInputProps extends ScreenProps {
  doneRecording: boolean;
  setName: (name: string) => void;
}

interface NameInputState {
  nameInput: string;
  flashingBlankInterval: null;
}

class NameInput extends React.PureComponent<NameInputProps, NameInputState> {
  private readonly saveSound: React.RefObject<HTMLAudioElement>;
  private checkIfRecorded: number | undefined;

  public constructor(props: NameInputProps) {
    super(props);
    this.saveSound = React.createRef<HTMLAudioElement>();
    this.state = {
      nameInput: '',
      flashingBlankInterval: null
    };
  }

  public componentDidMount(): void {
    window.addEventListener('keydown', this.handleNameInput);
  }

  private handleNameInput = (e: KeyboardEvent): void => {
    const ctx = this.props.canvasContext;

    if ( e.keyCode >= 65 && e.keyCode <= 90 && this.state.nameInput.length < 14 ) {
      this.setState({nameInput: this.state.nameInput + e.key}, this.showNameOnScreen)
    }
    if ( e.keyCode === 8 ) {
      this.setState({nameInput: this.state.nameInput.slice(0, -1)}, this.showNameOnScreen)
    }

    if ( e.keyCode === 13 && this.state.nameInput.length === 0 ) {

      ctx.textAlign = 'center'
      ctx.fillStyle = 'red'
      ctx.font = '25px Geneva'
      ctx.fillText("Enter a valid name", canvasWidth/2, 1045+50)
    }

    if ( e.keyCode === 13 && this.state.nameInput.length > 0 ) {
      window.removeEventListener('keydown', this.handleNameInput)

      this.props.setName(this.state.nameInput);

      this.clearInputArea(ctx)

      ctx.textAlign = 'center'
      ctx.fillStyle = 'yellow'
      ctx.font = '50px Geneva'
      ctx.fillText(this.state.nameInput, canvasWidth/2, 1045)

      ctx.font = '25px Geneva'
      ctx.fillText("Please wait", canvasWidth/2, 1045+50)

      this.checkIfRecorded = window.setInterval(() => {
        if (this.saveSound.current && this.props.doneRecording) {
          clearInterval(this.checkIfRecorded)

          this.saveSound.current.play();
          this.clearInputArea(ctx)

          ctx.fillStyle = '#00ff00'
          ctx.font = '50px Geneva'
          ctx.fillText(this.state.nameInput, canvasWidth/2, 1045)

          ctx.font = '25px Geneva'
          ctx.fillText("Success!", canvasWidth/2, 1045+50)

          setTimeout(() => {
            ctx.beginPath()
            ctx.rect(100, 920, canvasWidth - (100*2), 70)
            ctx.fillStyle = "#000000"
            ctx.fill()
            ctx.closePath()

            this.clearInputArea(ctx)

            ctx.textAlign = 'center'
            ctx.fillStyle = '#00ff00'
            ctx.font = '40px Geneva'
            ctx.fillText("Your score", canvasWidth/2, 945)
            ctx.fillText("has been recorded", canvasWidth/2, 945 + 45)


            setInterval(() => {
              ctx.textAlign = 'center'
              ctx.fillStyle = 'red'
              ctx.font = '40px Geneva'
              ctx.fillText("Press [ESC] to continue", canvasWidth/2, 1100)

              setTimeout(() => {
                ctx.beginPath()
                ctx.rect(100, 1100 - 40, canvasWidth - 200, 80)
                ctx.fillStyle = "#000000"
                ctx.fill()
                ctx.closePath()
              }, 1000)
            }, 1500)

          }, 1000)
        }
      }, 500)

    }
  }

  public componentWillUnmount(): void {
    window.removeEventListener('keydown', this.handleNameInput);
    clearInterval(this.checkIfRecorded);
  }

  public render(): React.ReactElement {
    return (
      <audio 
        src={'../save.wav'} 
        ref={this.saveSound}
      />
    );
  }

  private showNameOnScreen = (): void => {
    const ctx = this.props.canvasContext;

    ctx.beginPath()
    ctx.rect(100, 990, canvasWidth - (100*2), 70)
    ctx.fillStyle = "#000000"
    ctx.fill()
    ctx.closePath()

    if ( this.state.nameInput.length > 0 ) {
      ctx.textAlign = 'center'
      ctx.fillStyle = '#ff0000'
      ctx.font = '50px Geneva'
      ctx.fillText(this.state.nameInput, canvasWidth/2, 1045)
    }
  }

  private displayCursor = (ctx: CanvasRenderingContext2D) => {
    if ( this.state.nameInput.length === 0 ) {
      setInterval(() => {
        ctx.textAlign = 'center'
        ctx.fillStyle = 'red'
        ctx.font = '40px Geneva'
        ctx.fillText("|", canvasWidth/2, 990)

        setTimeout(this.clearInputArea, 1000)
      }, 1500)
    }
  }

  private clearInputArea = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath()
    ctx.rect(100, 990, canvasWidth - (100*2), 130)
    ctx.fillStyle = "#000000"
    ctx.fill()
    ctx.closePath()
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    doneRecording: state.doneRecording
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setName: (name: string) => dispatch(Actions.setName(name))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NameInput)
