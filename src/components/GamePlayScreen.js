import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { touristDensity, canvasWidth, canvasHeight } from '../setupData'
import { changePauseStatus, changeCurrentScreen, resetAllState, forcePathPlayerMapUpdate } from '../actions'

import Tourist from './Tourist'
import Timer from './Timer'
import Path from './Path'
import Player from './Player'

class GamePlayScreen extends Component {
  renderTourists = (numberOfTourists) => {
    let tourists = []
      for ( let i = 0; i < (numberOfTourists+this.props.stage); i++ ) {
        if ( !this.props.garbageOfTourists.includes(i) ) {
          tourists.push(<Tourist key={i} id={i} />)
        }
        else {
          numberOfTourists++
        }
      }

    return tourists
  }

  renderEnvironmentWithOngoingAnimation = () => {
    this.props.forcePathPlayerMapUpdate()
    for ( let tourist of this.props.touristRoaster ) {
      tourist.setState({touristUpdater: tourist.state.touristUpdater+1})
    }
  }

  handlePause = (e) => {
    if (e.key === 'q') {
      if (this.props.isPaused) {
        window.removeEventListener('keydown', this.handleExitAfterPause)
        this.props.backgroundMusic.play()
        this.renderEnvironmentWithOngoingAnimation()
      } else {
        const ctx = this.props.canvas.getContext("2d")
        ctx.beginPath()
        ctx.fillStyle = 'black'
        ctx.fillRect(50, canvasHeight/2 - 75, canvasWidth - 100, 100)
        ctx.closePath()

        ctx.textAlign = 'center'
        ctx.fillStyle = 'white'
        ctx.font = "60px Geneva"

        ctx.fillText(`PAUSED`, canvasWidth/2, canvasHeight/2)

        window.addEventListener('keydown', this.handleExitAfterPause)
        this.props.backgroundMusic.pause()
      }
      this.props.changePauseStatus()
    }
  }

  handleExitAfterPause = (e) => {
    if (e.key === 'w') {
      this.props.changeCurrentScreen("start")
      this.props.resetAllState()
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handlePause)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handlePause)
  }

  render() {
    return (
      <Fragment>
        <Timer />
        <Path />
        {this.renderTourists(touristDensity)}
        <Player />
      </Fragment>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    canvas: state.canvas,
    garbageOfTourists: state.garbageOfTourists,
    stage: state.stage,
    backgroundMusic: state.backgroundMusic,
    isPaused: state.isPaused,
    touristRoaster: state.touristRoaster
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    changePauseStatus: () => dispatch(changePauseStatus()),
    changeCurrentScreen: (screen) => dispatch(changeCurrentScreen(screen)),
    resetAllState: () => dispatch(resetAllState()),
    forcePathPlayerMapUpdate: () => dispatch(forcePathPlayerMapUpdate())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GamePlayScreen)
