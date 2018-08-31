import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getHighScores } from '../adapter/adapter'
import { canvasHeight, canvasWidth, numberOfHighScoresToDisplay } from '../setupData'
import { changeCurrentScreen, resetAllState } from '../actions'

class HighScores extends Component {
  state = {
    topScores: null
  }

  componentDidMount() {
    const canvas = this.refs.highScores
    const ctx = canvas.getContext("2d")

    ctx.beginPath()
    ctx.rect(0, 0, canvasWidth, canvasHeight)
    ctx.fillStyle = '#000000'
    ctx.fill()
    ctx.closePath()

    const loadingImg = new Image()
    loadingImg.src = '../loading.png'
    loadingImg.onload = () => {
      ctx.drawImage(loadingImg, (canvasWidth/2) - (680/2), canvasHeight/2 - 170, 680, 170)
    }

    getHighScores()
    .then(allScores => allScores.sort((score1, score2) => score2.distance - score1.distance))
    .then(sortedScores => sortedScores.slice(0, numberOfHighScoresToDisplay))
    .then(topScores => this.setState({topScores}))
  }

  componentDidUpdate() {
    const canvas = this.refs.highScores
    const ctx = canvas.getContext("2d")
    ctx.beginPath()
    ctx.rect(0, 0, canvasWidth, canvasHeight)
    ctx.fillStyle = '#000000'
    ctx.fill()
    ctx.closePath()

    if ( this.state.topScores ) {
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '50px Geneva'
      ctx.textAlign = 'center'

      let yCursor = 100

      ctx.fillText("HIGH SCORES", canvasWidth/2, yCursor)
      yCursor += 50
      yCursor += 12

      ctx.textAlign = 'left'

      ctx.font = '20px Geneva'
      ctx.fillText(`Total`, 320, yCursor)
      ctx.fillText(`Distance`, 450, yCursor)
      ctx.fillText(`Minutes`, 550, yCursor)
      ctx.fillText(`Key`, 650, yCursor)
      yCursor += 24
      ctx.fillText(`Distance`, 320, yCursor)
      ctx.fillText(`Streak`, 450, yCursor)
      ctx.fillText(`Lasted`, 550, yCursor)
      ctx.fillText(`Changes`, 650, yCursor)
      yCursor += 12 + 36

      ctx.font = '30px Geneva'
      let i = 1
      for ( let scoreData of this.state.topScores ) {
        ctx.fillText(`${i}. ${scoreData.name}`, 40, yCursor)
        ctx.fillText(`${scoreData.distance}`, 320, yCursor)
        ctx.fillText(`${scoreData.longest_streak}`, 450, yCursor)
        ctx.fillText(`${Math.round(((scoreData.time_lasted/100)/60)*100)/100}`, 550, yCursor)
        ctx.fillText(`${scoreData.direction_changes}`, 650, yCursor)
        yCursor += 12 + 36
        i++
      }

      ctx.font = "24px Geneva"
      ctx.fillStyle = "white"
      ctx.textAlign = 'right'
      ctx.fillText("[ESC] for Main Screen", canvasWidth-100, canvasHeight-100)

      window.addEventListener('keydown', this.switchToMainScreen)
    }
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
    return <canvas width={canvasWidth} height={canvasHeight} ref='highScores'></canvas>
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    changeCurrentScreen: (screen) => dispatch(changeCurrentScreen(screen)),
    resetAllState: () => dispatch(resetAllState())
  }
}

export default connect(null, mapDispatchToProps)(HighScores)
