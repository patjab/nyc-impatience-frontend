import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { changeCurrentScreen } from './actions'
import { canvasWidth, canvasHeight } from './setupData'
import { modularWithNegative } from './AuxiliaryMath'

class StartScreen extends Component {
  state = {
    choice: 0
  }

  playAudio = (src) => {
    const audioEl = document.createElement('audio')
    audioEl.setAttribute('id', src)
    audioEl.src = src
    audioEl.play()
  }

  userInputStartScreen = (e) => {
    e.preventDefault()
    if ( e.key === 'Enter' ) {
      switch(this.state.choice) {
        case 0:
          this.props.changeCurrentScreen("gamePlay")
          this.playAudio('./start.wav')
          break
        case 1:
          this.props.changeCurrentScreen("highScores")
          break
        case 2:
          alert("Go around the tourists")
          break
        default:
          break
      }
    }

    if ( e.key === 'ArrowUp' || e.key === 'ArrowDown' ) {
      if ( e.key === 'ArrowUp' ) {
        this.setState({choice: modularWithNegative(this.state.choice-1, 3)})
      } else if ( e.key === 'ArrowDown' ) {
        this.setState({choice: modularWithNegative(this.state.choice+1, 3)})
      }
      this.playAudio('./select.wav')
    }
  }

  userMenu = (ctx) => {
    ctx.textAlign = 'center'
    ctx.font = "100px Impact"
    ctx.fillStyle = "white"
    ctx.fillText("IMPATIENCE", canvasWidth/2, canvasHeight/2 - 300)

    ctx.textAlign = 'center'
    ctx.font = "40px Geneva"
    ctx.fillStyle = this.state.choice === 0 ? "red" : "white"
    ctx.fillText("Play Game", canvasWidth/2, canvasHeight/2 - 100)

    ctx.textAlign = 'center'
    ctx.font = "40px Geneva"
    ctx.fillStyle = this.state.choice === 1 ? "red" : "white"
    ctx.fillText("High Scores", canvasWidth/2, canvasHeight/2)

    ctx.textAlign = 'center'
    ctx.font = "40px Geneva"
    ctx.fillStyle = this.state.choice === 2 ? "red" : "white"
    ctx.fillText("Information", canvasWidth/2, canvasHeight/2 + 100)
  }

  sizeOfSide = 150
  xPosition = 95
  yPosition = 255

  componentDidMount() {
    window.addEventListener('keydown', this.userInputStartScreen)
    const ctx = this.refs.startScreen.getContext("2d")
    this.userMenu(ctx)
  }

  componentDidUpdate() {
    const ctx = this.refs.startScreen.getContext("2d")
    this.userMenu(ctx)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.userInputStartScreen)
  }

  render() {
    return (
      <Fragment>
        <canvas width={canvasWidth} height={canvasHeight} id='startScreen' ref='startScreen'></canvas>
        <img src='../fTrainSymbol.png' className='hidden' ref='fTrainSymbol' alt='fTrainSymbol'/>
      </Fragment>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    changeCurrentScreen: (screen) => dispatch(changeCurrentScreen(screen))
  }
}

export default connect(null, mapDispatchToProps)(StartScreen)
