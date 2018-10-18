import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { touristDensity } from '../setupData'
import { changePauseStatus, changeCurrentScreen, resetAllState, forcePathPlayerMapUpdate } from '../actions'

import Tourist from './Tourist'
import Timer from './Timer'
import Path from './Path'
import Player from './Player'
import Pause from './Pause'

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
    for ( let tourist of this.props.touristRoaster ) {
      tourist.setState({touristUpdater: tourist.state.touristUpdater+1}, this.props.forcePauseUpdate)
    }
    this.props.forcePathPlayerMapUpdate()
  }

  handlePause = (e) => {
    if (e.keyCode === 27) {
      if (this.props.isPaused) {
        window.removeEventListener('keydown', this.handleExitAfterPause)
        if (this.props.backgroundMusic) {
          this.props.backgroundMusic.play()
        }
      } else {
        window.addEventListener('keydown', this.handleExitAfterPause)
        if (this.props.backgroundMusic) {
          this.props.backgroundMusic.pause()
        }
        this.props.runningMusic.pause()
      }
      this.renderEnvironmentWithOngoingAnimation()
      this.props.changePauseStatus()
    }
  }

  handleExitAfterPause = (e) => {
    if (e.key === 'q') {
      this.props.changeCurrentScreen("start")
      this.props.resetAllState()
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handlePause)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handlePause)
    window.removeEventListener('keydown', this.handleExitAfterPause)
  }

  render() {
    return (
      <Fragment>
        <Timer />
        <Path />
        {this.renderTourists(touristDensity)}
        {this.props.isPaused ? <Pause /> : null}
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
    touristRoaster: state.touristRoaster,
    runningMusic: state.runningMusic
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
