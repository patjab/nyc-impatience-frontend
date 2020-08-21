import React, { Component } from 'react'
import { connect } from 'react-redux'
import { canvasWidth, statusBarHeight } from '../setupData'
import {Actions} from '../store/Actions';

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
    this.props.canvasContext.clearRect(canvasWidth*0.70, 0, canvasWidth*0.30, statusBarHeight)
    this.props.canvasContext.fillStyle = 'black'
    this.props.canvasContext.fillRect(canvasWidth*0.70, 0, canvasWidth*0.30, statusBarHeight)
    this.drawTime(this.props.canvasContext)
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
  }

  incrementTime = (e) => {
    if ( e.key === 'ArrowUp' ) {
      this.setState({startTime: new Date()}, () => {
        setInterval(() => {
          if ( !this.props.isPaused ) {
            this.props.incrementTime((new Date() - this.state.startTime) - this.props.totalPausedTime)
          }
        }, 1000)

        window.removeEventListener('keydown', this.incrementTime)

      })
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.incrementTime);
    this.drawStatusBar();
    this.drawTime(this.props.canvasContext);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.willBeDone) { return false }
    return true
  }

  showGameOverScreen = () => {
    // TODO: Renable this as a more specific context was passed thorugh here
    const gameOverImg = this.props.canvas.toDataURL("image/png")
    this.props.setGameOverImage(gameOverImg)
  }

  componentDidUpdate() {
    console.log('CALLING')
    if (this.props.patience <= 0) {
      this.props.recordStreak(this.props.movement);
      this.props.recordTimeFinished(this.props.time/1000);
      this.showGameOverScreen();
    }
  }

  render() {
    this.drawStatusBar()
    return (
      <>
        <Patience canvasContext={this.props.canvasContext}/>
        <Ability canvasContext={this.props.canvasContext}/>
      </>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    movement: state.movement,
    streak: state.streak,
    patience: state.patience,
    time: state.time,
    totalPausedTime: state.totalPausedTime,
    isPaused: state.isPaused
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setGameOver: () => dispatch(Actions.setGameOver()),
    setGameOverImage: (image) => dispatch(Actions.setGameOverImage(image)),
    recordTimeFinished: (time) => dispatch(Actions.recordTimeFinished(time)),
    modifyPatience: (modifier) => dispatch(Actions.modifyPatience(modifier)),
    recordStreak: (streak) => dispatch(Actions.recordStreak(streak)),
    incrementTime: (time) => dispatch(Actions.incrementTime(time))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Timer)
