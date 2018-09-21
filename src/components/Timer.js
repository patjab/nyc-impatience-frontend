import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { canvasWidth, statusBarHeight, movingQuicklyPatience } from '../setupData'
import { setGameOver, setGameOverImage, recordTimeFinished, modifyPatience, signalBonusOut, recordStreak, incrementTime } from '../actions'
import { activeMegaphone, inactiveMegaphone } from '../images'


import Patience from './Patience'
import Ability from './Ability'

class Timer extends Component {
  state = {
    willBeDone: false,
    startTime: 0
  }

  formatTime() {
    return {minutes: Math.trunc((this.props.time/1000)/60), seconds: Math.trunc((this.props.time/1000) % (60)), milliseconds: this.props.time % 1000}
  }

  formatMovement() {
    return this.state.willBeDone ? `${("000000" + Math.max.apply(null, this.props.streak)).slice(-7)}` : `${("000000" + this.props.movement).slice(-7)}`
  }

  drawStatusBar = () => {
    const ctx = this.props.canvas ? this.props.canvas.getContext("2d") : null
    if (ctx) {
      ctx.clearRect(canvasWidth*0.70, 0, canvasWidth*0.30, statusBarHeight)
      ctx.fillStyle = 'black'
      ctx.fillRect(canvasWidth*0.70, 0, canvasWidth*0.30, statusBarHeight)
      this.drawTime(ctx)
    }
  }

  drawTime = (ctx) => {
    const currentTime = this.formatTime()
    ctx.textAlign = 'center'
    ctx.font = "20px Geneva"
    ctx.fillStyle = "white"
    ctx.fillText(`Time`, canvasWidth-110, 30)

    ctx.textAlign = 'center'
    ctx.font = "36px Geneva"
    ctx.fillStyle = "red"
    ctx.fillText(`${("0" + currentTime.minutes).slice(-2)}:${("0" + currentTime.seconds).slice(-2)}`, canvasWidth-110, 70)
    // ctx.fillText(`${("0" + currentTime.minutes).slice(-2)}:${("0" + currentTime.seconds).slice(-2)}.${("0" + currentTime.milliseconds).slice(-2)}`, canvasWidth-110, 70)
  }

  incrementTime = (e) => {
    if ( e.key === 'ArrowUp' ) {
      console.log('creating a new interval')

      this.setState({startTime: new Date()}, () => {

        setInterval(() => {
          this.props.incrementTime((new Date() - this.state.startTime))
          const timeInSec = this.props.time/1000
          // if (Math.trunc(timeInSec) % 30 === 0 && this.props.time > 0 ) {
          //   console.log("REACHED 30s INTERVAL")
          //   this.props.signalBonusOut()
          //   if ( (this.props.time / 30000) * 1000 < this.props.movement ) {
          //     console.log("ABOVE 1000")
          //     this.props.modifyPatience(movingQuicklyPatience)
          //   }
          // }

        }, 1000)

        window.removeEventListener('keydown', this.incrementTime)

      })
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.incrementTime)
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.willBeDone) { return false }
    return true
  }

  showGameOverScreen = () => {
    const gameOverImg = this.props.canvas.toDataURL("image/png")
    this.props.setGameOverImage(gameOverImg)
  }

  componentDidUpdate() {
    if (this.props.patience <= 0) {
      this.props.recordStreak(this.props.movement)
      this.props.recordTimeFinished(this.props.time)
      this.showGameOverScreen()
    }
  }

  render() {
    this.drawStatusBar()
    return (
      <Fragment>
        <Patience/>
        <Ability/>
      </Fragment>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    canvas: state.canvas,
    movement: state.movement,
    lives: state.lives,
    streak: state.streak,
    patience: state.patience,
    playerYelled: state.playerYelled,
    time: state.time
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setGameOver: () => dispatch(setGameOver()),
    setGameOverImage: (image) => dispatch(setGameOverImage(image)),
    recordTimeFinished: (time) => dispatch(recordTimeFinished(time)),
    modifyPatience: (modifier) => dispatch(modifyPatience(modifier)),
    signalBonusOut: () => dispatch(signalBonusOut()),
    recordStreak: (streak) => dispatch(recordStreak(streak)),
    incrementTime: (time) => dispatch(incrementTime(time))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Timer)
