import React, { Component } from 'react'
import { connect } from 'react-redux'
import { canvasWidth } from '../setupData'
import { setName } from '../actions'

class NameInput extends Component {
  state = {
    nameInput: "",
    flashingBlankInterval: null
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleNameInput)
  }

  handleNameInput = (e) => {
    if ( e.keyCode >= 65 && e.keyCode <= 90 && this.state.nameInput.length < 14 ) {
      this.setState({nameInput: this.state.nameInput + e.key}, this.showNameOnScreen)
    }
    if ( e.keyCode === 8 ) {
      this.setState({nameInput: this.state.nameInput.slice(0, -1)}, this.showNameOnScreen)
    }

    if ( e.keyCode === 13 ) {
      window.removeEventListener('keydown', this.handleNameInput)
      const ctx = this.props.canvas.getContext("2d")

      this.props.setName(this.state.nameInput)

      this.clearInputArea(ctx)

      ctx.textAlign = 'center'
      // ctx.fillStyle = '#00ff00'
      ctx.fillStyle = 'yellow'
      ctx.font = '50px Geneva'
      ctx.fillText(this.state.nameInput, canvasWidth/2, 1045)

      this.checkIfRecorded = setInterval(() => {
        if (this.props.doneRecording) {
          clearInterval(this.checkIfRecorded)

          this.refs.saveSound.play()

          ctx.fillStyle = '#00ff00'
          ctx.font = '50px Geneva'
          ctx.fillText(this.state.nameInput, canvasWidth/2, 1045)

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

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleNameInput)
    clearInterval(this.checkIfRecorded)
  }

  clearInputArea = (ctx) => {
    ctx.beginPath()
    ctx.rect(100, 990, canvasWidth - (100*2), 70)
    ctx.fillStyle = "#000000"
    ctx.fill()
    ctx.closePath()
  }

  displayCursor = (ctx) => {
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

  showNameOnScreen = () => {
    const ctx = this.props.canvas.getContext("2d")

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

  render() {
    return <audio src='../save.wav' ref='saveSound'/ >
  }
}

const mapStateToProps = (state) => {
  return {
    canvas: state.canvas,
    doneRecording: state.doneRecording
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setName: (name) => dispatch(setName(name))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NameInput)
