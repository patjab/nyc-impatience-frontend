import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { canvasWidth, canvasHeight, heightOfMap, movementPerMap, percentageDivisionOnMap, movingQuicklySecondsRequirement } from '../setupData'

class Map extends Component {
  previousFirstMarker = 0

  drawMap = (ctx) => {
    const mapMargins = 0
    const widthOfMap = canvasWidth - (mapMargins*2)

    const startOfMap = 50
    const endOfMap = canvasWidth - 50
    const yPositionOfMap = canvasHeight - 110

    const percentOfMap = this.props.movement % movementPerMap
    const lapsOf5000 = Math.trunc(this.props.movement / movementPerMap)
    const lengthOfMap = (endOfMap - startOfMap)
    const pixelLengthOfCurrentProgress = (percentOfMap*lengthOfMap) / movementPerMap

    const currentTimeInSec = Math.trunc(this.props.time/1000)
    const lastRecBonusTime = Math.trunc(this.props.recordForBonus[this.props.recordForBonus.length - 1].time)
    const penultimateRecBonusTime = this.props.recordForBonus.length >= 2 ? Math.trunc(this.props.recordForBonus[this.props.recordForBonus.length - 2].time) : undefined
    const timeLeftForBonus = movingQuicklySecondsRequirement - (currentTimeInSec - lastRecBonusTime)
    const nextBonusMovementCheckpoint = this.props.recordForBonus[this.props.recordForBonus.length - 1].movement + 1000

    ctx.beginPath()
    ctx.rect(mapMargins, canvasHeight - mapMargins - heightOfMap, widthOfMap, heightOfMap)
    ctx.fillStyle = "#000000"
    ctx.fill()
    ctx.closePath()

    if ( timeLeftForBonus > 27 && (lastRecBonusTime - penultimateRecBonusTime < movingQuicklySecondsRequirement ) ) {
      ctx.font = "50px Geneva"
      ctx.fillStyle = "yellow"
      ctx.textAlign = 'center'
      ctx.fillText(`BONUS AWARDED`, canvasWidth/2, canvasHeight - (heightOfMap/2))
    } else {
        ctx.beginPath()
        ctx.moveTo(startOfMap, yPositionOfMap)
        ctx.lineTo(endOfMap, yPositionOfMap)
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 5
        ctx.stroke()
        ctx.closePath()

        ctx.beginPath()
        ctx.moveTo(startOfMap, yPositionOfMap)
        ctx.lineTo(startOfMap + pixelLengthOfCurrentProgress, yPositionOfMap)
        ctx.strokeStyle = 'red'
        ctx.lineWidth = 5
        ctx.stroke()
        ctx.closePath()

        for ( let percent = 0.0; percent <= 1.0; percent += percentageDivisionOnMap) {
          ctx.beginPath()
          ctx.arc(startOfMap + (percent * lengthOfMap), yPositionOfMap, 10, 0, 2 * Math.PI)
          ctx.fillStyle = percentOfMap > (percent * movementPerMap) ? "red" : "white"
          ctx.fill()
          ctx.closePath()

          ctx.textAlign = 'center'
          ctx.font = "20px Geneva"
          ctx.fillStyle = "white"
          ctx.fillText(`${Math.trunc((lapsOf5000 * movementPerMap) + percent * movementPerMap)}`, startOfMap + (percent * lengthOfMap), yPositionOfMap + 40)
          if ( Math.trunc((lapsOf5000 * movementPerMap) + percent * movementPerMap) === nextBonusMovementCheckpoint ) {
            ctx.font = "15px Geneva"
            ctx.fillStyle = "yellow"

            if ( timeLeftForBonus > 0 ) {
              ctx.fillText(`NEXT BONUS`, startOfMap + (percent * lengthOfMap), yPositionOfMap + 60)
              ctx.fillText(`${timeLeftForBonus}s`, startOfMap + (percent * lengthOfMap), yPositionOfMap + 80)
            }
          }
        }

        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 1
    }

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
    player: state.player,
    recordForBonus: state.recordForBonus,
    time: state.time
  }
}

export default connect(mapStateToProps)(Map)
