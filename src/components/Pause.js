import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { canvasWidth, canvasHeight } from '../setupData'

class Pause extends Component {
  render() {
    const ctx = this.props.canvas.getContext("2d")
    ctx.beginPath()
    ctx.fillStyle = 'maroon'
    ctx.fillRect(50, canvasHeight/2 - 75 - 200, canvasWidth - 100, 150)
    ctx.closePath()

    ctx.textAlign = 'center'
    ctx.fillStyle = 'white'
    ctx.font = "50px Geneva"

    ctx.fillText(`PAUSED`, canvasWidth/2, canvasHeight/2 - 200)

    ctx.textAlign = 'center'
    ctx.fillStyle = 'white'
    ctx.font = "20px Geneva"

    ctx.fillText(`Press [q] to exit`, canvasWidth/2, canvasHeight/2 - 200 + 40)

    return <Fragment></Fragment>
  }
}

const mapStateToProps = (state) => {
  return {
    canvas: state.canvas,
    pauseUpdater: state.pauseUpdater
  }
}

export default connect(mapStateToProps)(Pause)
