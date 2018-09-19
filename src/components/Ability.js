import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { canvasWidth, statusBarHeight, initialPatience } from '../setupData'
import { activeMegaphone, inactiveMegaphone, activeRunning, inactiveRunning } from '../images'

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
    shoutIcon.src = this.props.playerYelled ? inactiveMegaphone : activeMegaphone
    shoutIcon.onload = () => {
      ctx.drawImage(shoutIcon, (canvasWidth*0.30)*0.15, 35, 40, 40)
    }

    const runningIcon = new Image()
    runningIcon.src = this.props.playerYelled ? inactiveRunning : activeRunning
    runningIcon.onload = () => {
      ctx.drawImage(runningIcon, ((canvasWidth*0.30)*0.40)-1, 35, 40, 40)
      ctx.drawImage(runningIcon, (canvasWidth*0.30)*0.40, 35, 40, 40)
      ctx.drawImage(runningIcon, ((canvasWidth*0.30)*0.40)+1, 35, 40, 40)
    }

    // const runningIcon = new Image()
    // runningIcon.src = this.props.playerYelled ? inactiveRunning : activeRunning
    // runningIcon.onload = () => {
    //   ctx.drawImage(runningIcon, (canvasWidth*0.30)*0.40, 35, 40, 40)
    //   ctx.drawImage(runningIcon, (canvasWidth*0.30)*0.65, 35, 40, 40)
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
    playerYelled: state.playerYelled
  }
}

export default connect(mapStateToProps)(Ability)
