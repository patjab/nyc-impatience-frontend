import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { canvasWidth, canvasHeight } from '../setupData'

class Map extends Component {
  previousFirstMarker = 0

  drawMap = (ctx) => {
    const mapMargins = 0
    const widthOfMap = canvasWidth - (mapMargins*2)
    const heightOfMap = 150
    ctx.beginPath()
    ctx.rect(mapMargins, canvasHeight - mapMargins - heightOfMap, widthOfMap, heightOfMap)
    ctx.fillStyle = "#000000"
    ctx.fill()
    ctx.closePath()

    const startOfMap = 50
    const endOfMap = canvasWidth - 50
    const yPositionOfMap = canvasHeight - 110
    ctx.beginPath()
    ctx.moveTo(startOfMap, yPositionOfMap)
    ctx.lineTo(endOfMap, yPositionOfMap)
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 5
    ctx.stroke()
    ctx.closePath()

    const percentOf5000 = this.props.movement % 5000
    const lapsOf5000 = Math.trunc(this.props.movement / 5000)

    const lengthOfMap = (endOfMap - startOfMap)
    const pixelLengthOfCurrentProgress = (percentOf5000*lengthOfMap) / 5000
    ctx.beginPath()
    ctx.moveTo(startOfMap, yPositionOfMap)
    ctx.lineTo(startOfMap + pixelLengthOfCurrentProgress, yPositionOfMap)
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 5
    ctx.stroke()
    ctx.closePath()

    for ( let percent = 0.0; percent <= 1.0; percent += 0.20) {
      ctx.beginPath()
      ctx.arc(startOfMap + (percent * lengthOfMap), yPositionOfMap, 10, 0, 2 * Math.PI)
      ctx.fillStyle = percentOf5000 > (percent * 5000) ? "red" : "white"
      ctx.fill()
      ctx.closePath()

      ctx.textAlign = 'center'
      ctx.font = "20px Geneva"
      ctx.fillStyle = "white"
      ctx.fillText(`${Math.trunc((lapsOf5000 * 5000) + percent * 5000)}`, startOfMap + (percent * lengthOfMap), yPositionOfMap + 40)
    }

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1
  }

  componentDidMount() {
    const canvas = this.props.canvas
    if (canvas) {
      const ctx = canvas.getContext("2d")
      this.drawMap(ctx)
    }
  }

  componentDidUpdate() {
    const canvas = this.props.canvas
    const ctx = canvas.getContext("2d")

    this.drawMap(ctx)
  }

  render() {
    return <Fragment></Fragment>
  }
}

const mapStateToProps = (state) => {
  return {
    canvas: state.canvas,
    movement: state.movement,
    mapUpdater: state.mapUpdater,
    player: state.player
  }
}

export default connect(mapStateToProps)(Map)
