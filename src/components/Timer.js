import React, { Component } from 'react'
import { connect } from 'react-redux'
import { canvasWidth, statusBarHeight, movingQuicklyPatience } from '../setupData'
import { setGameOver, setGameOverImage, recordTimeFinished, modifyPatience, signalBonusOut, recordStreak } from '../actions'

import Patience from './Patience'

class Timer extends Component {
  state = {
    time: 0,
    willBeDone: false
  }

  formatTime() {
    return {minutes: Math.trunc((this.state.time/100)/60), seconds: Math.trunc((this.state.time/100) % (60)), milliseconds: this.state.time % 100}
  }

  formatMovement() {
    return this.state.willBeDone ? `${("000000" + Math.max.apply(null, this.props.streak)).slice(-7)}` : `${("000000" + this.props.movement).slice(-7)}`
  }

  drawStatusBar = () => {
    const ctx = this.props.canvas ? this.props.canvas.getContext("2d") : null
    if (ctx) {
      ctx.clearRect(0, 0, canvasWidth*0.30, statusBarHeight)
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, canvasWidth*0.30, statusBarHeight)

      ctx.clearRect(canvasWidth*0.70, 0, canvasWidth*0.30, statusBarHeight)
      ctx.fillStyle = 'black'
      ctx.fillRect(canvasWidth*0.70, 0, canvasWidth*0.30, statusBarHeight)

      this.drawStepsCounter(ctx)
      this.drawTime(ctx)
    }
  }

  drawTime = (ctx) => {
    const currentTime = this.formatTime()

    ctx.font = "20px Geneva"
    ctx.fillStyle = "white"
    ctx.fillText(`Time`, canvasWidth-140, 30)

    ctx.font = "36px Geneva"
    ctx.fillStyle = "red"
    ctx.fillText(`${("0" + currentTime.minutes).slice(-2)}:${("0" + currentTime.seconds).slice(-2)}.${("0" + currentTime.milliseconds).slice(-2)}`, canvasWidth-200, 70)
  }

  drawStepsCounter = (ctx) => {
    ctx.textAlign = 'center'
    ctx.font = "20px Geneva"
    ctx.fillStyle = "white"
    this.state.willBeDone ? ctx.fillText(`Distance`, 120, 30) : ctx.fillText(`Distance`, 120, 30)

    ctx.font = "36px Geneva"
    ctx.fillStyle = "red"
    ctx.fillText(`${Math.round(this.formatMovement())}`, 120, 70)
    ctx.textAlign = 'left'

  }

  incrementTime = (e) => {
    if ( e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      setInterval(() => this.setState({time: this.state.time + 1}, () => {
        if (this.state.time % 2000 === 0 && this.state.time > 0 ) {
          console.log("REACHED 20s INTERVAL")
          this.props.signalBonusOut()
          if ( (this.state.time / 2000) * 1000 < this.props.movement ) {
            console.log("ABOVE 1000")
            this.props.modifyPatience(movingQuicklyPatience)
          }
        }
      }), 10)
      window.removeEventListener('keydown', this.incrementTime)
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.incrementTime)
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.willBeDone) { return false }
    if (nextProps.lives <= 0) {
      this.setState({willBeDone: true})
    }
    return true
  }

  showGameOverScreen = () => {
    const gameOverImg = this.props.canvas.toDataURL("image/png")
    this.props.setGameOverImage(gameOverImg)
  }

  componentDidUpdate() {
    if (this.props.patience <= 0) {
      // If gameOver through not bumping, but just running out of patience record movement
      // if (!this.props.streak.includes(this.props.movement)) {
      this.props.recordStreak(this.props.movement)
      // }
      this.props.recordTimeFinished(this.state.time)
      this.showGameOverScreen()
    }
  }

  render() {
    this.drawStatusBar()
    return <Patience/>
  }
}

const mapStateToProps = (state) => {
  return {
    canvas: state.canvas,
    movement: state.movement,
    lives: state.lives,
    streak: state.streak,
    patience: state.patience
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setGameOver: () => dispatch(setGameOver()),
    setGameOverImage: (image) => dispatch(setGameOverImage(image)),
    recordTimeFinished: (time) => dispatch(recordTimeFinished(time)),
    modifyPatience: (modifier) => dispatch(modifyPatience(modifier)),
    signalBonusOut: () => dispatch(signalBonusOut()),
    recordStreak: (streak) => dispatch(recordStreak(streak))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Timer)
