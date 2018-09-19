import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

import { canvasWidth, statusBarHeight } from '../setupData'
import { megaphone } from '../images'

class ShoutTimer extends Component {
  drawLoudnessRechargeTimer = () => {
    const margin = 15

    const top = statusBarHeight + margin
    const left = canvasWidth - 240

    const width = 240 - margin
    const height = 75

    const ctx = this.props.canvas ? this.props.canvas.getContext("2d") : null
    if (ctx) {
      // ctx.clearRect(left, top, width, height)
      // ctx.fillStyle = 'black'
      // ctx.fillRect(left, top, width, height)
      //
      // ctx.beginPath()
      // ctx.moveTo(left, top)
      // ctx.lineTo(left + width, top)
      // ctx.lineTo(left + width, top + height)
      // ctx.lineTo(left, top + height)
      // ctx.closePath()
      // ctx.strokeStyle = 'white'
      // ctx.lineWidth = 5
      // ctx.stroke()
      // ctx.lineWidth = 1

      const shoutIcon = new Image()
      shoutIcon.src = megaphone
      shoutIcon.onload = () => {
        ctx.drawImage(shoutIcon, left, top, height, height)
      }

    }
  }

  render() {
    this.drawLoudnessRechargeTimer()
    return <Fragment></Fragment>
  }
}

const mapStateToProps = (state) => {
  return {
    canvas: state.canvas,
    player: state.player
  }
}

export default connect(mapStateToProps)(ShoutTimer)
