import React, { Component } from 'react'
import { connect } from 'react-redux'
import { canvasHeight, canvasWidth } from '../setupData'
import { changeCurrentScreen, resetAllState } from '../actions'

class Instructions extends Component {
  state = {
    topScores: null
  }

  componentDidMount() {
    const canvas = this.refs.instructions
    const ctx = canvas.getContext("2d")
    ctx.beginPath()
    ctx.rect(0, 0, canvasWidth, canvasHeight)
    ctx.fillStyle = '#000000'
    ctx.fill()
    ctx.closePath()

    ctx.fillStyle = '#FFFFFF'
    ctx.font = '50px Geneva'
    ctx.textAlign = 'center'

    let yCursor = 100

    ctx.fillStyle = '#FFFFFF'
    ctx.fillText("GAME PLAY", canvasWidth/2, yCursor)

    yCursor += 50
    ctx.font = '24px Geneva'
    ctx.textAlign = 'center'
    ctx.fillText("Ever feel like you lose patience with people from out of ", canvasWidth/2, yCursor)
    yCursor += 24
    ctx.fillText("town just hogging valuable sidewalk space in New York? ", canvasWidth/2, yCursor)
    yCursor += 24
    ctx.fillText("Your everyday walk involves the horrible experience of ", canvasWidth/2, yCursor)
    yCursor += 24
    ctx.fillText("dodging standstill tourists stopping in awe at every sight ", canvasWidth/2, yCursor)
    yCursor += 24
    ctx.fillText("your magnificent city has to offer, testing your patience.", canvasWidth/2, yCursor)
    yCursor += 24

    const marginBetweenParagraphs = 60

    ctx.fillStyle = 'yellow'
    yCursor += marginBetweenParagraphs
    ctx.font = '36px Impact'
    ctx.textAlign = 'center'
    ctx.fillText("OBJECTIVE", canvasWidth/2, yCursor)
    yCursor += 34

    ctx.font = '24px Geneva'
    ctx.fillText("See how far you can get without letting your patience ", canvasWidth/2, yCursor)
    yCursor += 24
    ctx.fillText("meter hit 0%.", canvasWidth/2, yCursor)
    yCursor += 24



    ctx.fillStyle = 'red'
    yCursor += marginBetweenParagraphs
    ctx.font = '36px Impact'
    ctx.textAlign = 'center'
    ctx.fillText("GAINING/LOSING PATIENCE", canvasWidth/2, yCursor)
    yCursor += 34
    ctx.font = '24px Geneva'
    ctx.textAlign = 'left'
    const instructionMargin = 30
    ctx.fillText("You start with 250 patience points.", instructionMargin, yCursor)
    yCursor += 24
    ctx.fillText(" -5 for having to change direction (keyup event)", instructionMargin, yCursor)
    yCursor += 24
    ctx.fillText(" -100 for colliding with a tourist", instructionMargin, yCursor)
    yCursor += 24
    ctx.fillText(" -10 for not moving for two seconds", instructionMargin, yCursor)
    yCursor += 24
    ctx.fillText(" +25 for moving quickly (1000 every 10 seconds)", instructionMargin, yCursor)
    yCursor += 24

    ctx.fillStyle = 'orange'
    yCursor += marginBetweenParagraphs
    ctx.font = '36px Impact'
    ctx.textAlign = 'center'
    ctx.fillText("STRAIGHT PATH PATIENCE", canvasWidth/2, yCursor)
    yCursor += 34

    ctx.font = '24px Geneva'
    ctx.textAlign = 'center'
    ctx.fillText("The players who advance the furthest in the game do not ", canvasWidth/2, yCursor)
    yCursor += 24

    ctx.fillText("change directions often and try to stick to the smoothest ", canvasWidth/2, yCursor)
    yCursor += 24

    ctx.fillText("and most fluid movements, often moving in a diagonal ", canvasWidth/2, yCursor)
    yCursor += 24

    ctx.fillText("manner. Although changing directions is necessary, try ", canvasWidth/2, yCursor)
    yCursor += 24

    ctx.fillText("to minimize this. ", canvasWidth/2, yCursor)
    yCursor += 24




    ctx.fillStyle = 'pink'
    yCursor += marginBetweenParagraphs
    ctx.font = '36px Impact'
    ctx.textAlign = 'center'
    ctx.fillText("YELL AT THE TOURISTS", canvasWidth/2, yCursor)
    yCursor += 34

    ctx.font = '24px Geneva'
    ctx.fillText("You can yell at the tourists through your computer ", canvasWidth/2, yCursor)
    yCursor += 24

    ctx.fillText("microphone to try to get them out of the way. There ", canvasWidth/2, yCursor)
    yCursor += 24

    ctx.fillText("is a certain threshold volume you must yell at in ", canvasWidth/2, yCursor)
    yCursor += 24

    ctx.fillText("order to get them to move out of the way. However, ", canvasWidth/2, yCursor)
    yCursor += 24

    ctx.fillText("you may only do this every 30 seconds.", canvasWidth/2, yCursor)
    yCursor += 24

    ctx.fillStyle = 'white'
    ctx.fillText("[ESC] for Main Screen", canvasWidth-200, canvasHeight-100)

    window.addEventListener('keydown', this.switchToMainScreen)

  }

  switchToMainScreen = (e) => {
    if (e.keyCode === 27) {
      this.props.changeCurrentScreen("start")
    }
  }

  componentWillUnmount() {
    this.props.resetAllState()
    window.removeEventListener('keydown', this.switchToMainScreen)
  }

  render() {
    return <canvas width={canvasWidth} height={canvasHeight} ref='instructions'></canvas>
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    changeCurrentScreen: (screen) => dispatch(changeCurrentScreen(screen)),
    resetAllState: () => dispatch(resetAllState())
  }
}

export default connect(null, mapDispatchToProps)(Instructions)
