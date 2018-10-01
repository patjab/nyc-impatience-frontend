import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { canvasWidth, statusBarHeight, loudnessRechargeInSeconds, maximumSecondsOfRecharge, maximumSecondsOfRunning, walking } from '../setupData'
import { activeMegaphone, inactiveMegaphone, activeRunning, inactiveRunning, redRunning, activeSnow, inactiveSnow } from '../images'

class Ability extends Component {
  drawYellStatus = (ctx) => {
    ctx.clearRect(0, 0, canvasWidth*0.30, statusBarHeight)
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvasWidth*0.30, statusBarHeight)

    ctx.textAlign = 'center'
    ctx.font = "20px Geneva"
    ctx.fillStyle = "white"
    ctx.fillText(`Abilities`, (canvasWidth*0.30)/2, 30)

    const shoutIcon = new Image()
    const timePassedYell = Math.round((this.props.time/1000) - this.props.timeOfYell)
    const readyForYelling = timePassedYell > loudnessRechargeInSeconds
    shoutIcon.src = readyForYelling ? activeMegaphone : inactiveMegaphone


    shoutIcon.onload = () => {
      ctx.drawImage(shoutIcon, (canvasWidth*0.30)*0.28, 35, 40, 40)
      if ( !readyForYelling && timePassedYell > 0) {
        ctx.font = "25px Impact"
        ctx.textAlign = 'center'
        ctx.fillStyle = "red"
        ctx.fillText(loudnessRechargeInSeconds - timePassedYell, (canvasWidth*0.30)*0.42, 85)
      }
    }


    const runningIcon = new Image()
    const timePassedRun = Math.round((this.props.time/1000) - this.props.timeOfRun)
    const readyForRunning = timePassedRun >= maximumSecondsOfRecharge


    if ( readyForRunning ) {
      runningIcon.src = activeRunning
    } else if ( !readyForRunning && this.props.speed === 2 * walking ) {
      runningIcon.src = redRunning
    } else {
      runningIcon.src = inactiveRunning
    }

    runningIcon.onload = () => {
      ctx.drawImage(runningIcon, (canvasWidth*0.30)*0.53, 35, 40, 40)
      if ( !readyForRunning && this.props.speed === walking ) {
        ctx.font = "25px Impact"
        ctx.textAlign = 'center'
        ctx.fillStyle = "red"
        ctx.fillText(maximumSecondsOfRecharge - timePassedRun, (canvasWidth*0.30)*0.70, 85)
      }
    }

    // const snowIcon = new Image()
    // snowIcon.src = this.props.snowAbilityList.filter(record => record.used === false).length > 0 ? activeSnow : inactiveSnow
    //
    // snowIcon.onload = () => {
    //   ctx.drawImage(snowIcon, (canvasWidth*0.30)*0.65, 35, 40, 40)
    // }
  }

  render() {
    const ctx = this.props.canvas ? this.props.canvas.getContext("2d") : null
    if (ctx) {
      this.drawYellStatus(ctx)
    }
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
