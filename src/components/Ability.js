import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { canvasWidth, statusBarHeight, loudnessRechargeInSeconds, maximumSecondsOfRecharge, maximumSecondsOfRunning, walking } from '../setupData'
import { activeMegaphone, inactiveMegaphone, activeRunning, inactiveRunning, redRunning, activeSnow, inactiveSnow } from '../images'

class Ability extends Component {
  clearAbilityBackground = (ctx) => {
    ctx.clearRect(0, 0, canvasWidth*0.30, statusBarHeight)
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvasWidth*0.30, statusBarHeight)
  }

  drawUpdatedImagesAndTimers = (ctx, shoutIcon, timePassedYell, readyForYelling, runningIcon, timePassedRun, readyForRunning) => {
    ctx.textAlign = 'center'
    ctx.font = "20px Geneva"
    ctx.fillStyle = "white"
    ctx.fillText(`Abilities`, (canvasWidth*0.30)/2, 30)

    ctx.drawImage(shoutIcon, (canvasWidth*0.30)*0.28, 35, 40, 40)
    if ( !readyForYelling && timePassedYell > 0) {
      ctx.font = "25px Impact"
      ctx.textAlign = 'center'
      ctx.fillStyle = "red"
      ctx.fillText(loudnessRechargeInSeconds - timePassedYell, (canvasWidth*0.30)*0.42, 85)
    }

    ctx.drawImage(runningIcon, (canvasWidth*0.30)*0.53, 35, 40, 40)
    if ( !readyForRunning && this.props.speed === walking ) {
      ctx.font = "25px Impact"
      ctx.textAlign = 'center'
      ctx.fillStyle = "red"
      ctx.fillText(maximumSecondsOfRecharge - timePassedRun, (canvasWidth*0.30)*0.70, 85)
    }
  }

  componentDidMount() {
    if (this.props.canvas) {
      const ctx = this.props.canvas.getContext("2d")
      this.clearAbilityBackground(ctx)
    }
  }

  componentDidUpdate() {
    const ctx = this.props.canvas.getContext("2d")

    const timePassedYell = Math.round((this.props.time/1000) - this.props.timeOfYell)
    const timePassedRun = Math.round((this.props.time/1000) - this.props.timeOfRun)

    const readyForYelling = timePassedYell > loudnessRechargeInSeconds
    const readyForRunning = timePassedRun >= maximumSecondsOfRecharge

    const shoutIcon = new Image()
    shoutIcon.src = readyForYelling ? activeMegaphone : inactiveMegaphone

    const runningIcon = new Image()
    runningIcon.src = readyForRunning ? activeRunning : ( this.props.speed === 2 * walking ? redRunning : inactiveRunning )

    shoutIcon.onload = () => {
      runningIcon.onload = () => {
        this.clearAbilityBackground(ctx)
        this.drawUpdatedImagesAndTimers(ctx, shoutIcon, timePassedYell, readyForYelling, runningIcon, timePassedRun, readyForRunning)
      }
    }
  }

  render() {
    return <Fragment></Fragment>
  }
}

const mapStateToProps = (state) => {
  return {
    canvas: state.canvas,
    playerYelled: state.playerYelled,
    snowAbilityList: state.snowAbilityList,
    time: state.time,
    timeOfYell: state.timeOfYell,
    timeOfRun: state.timeOfRun,
    speed: state.speed
  }
}

export default connect(mapStateToProps)(Ability)
