import React, {Component} from 'react'
import {connect} from 'react-redux'
import {changePauseStatus, changeCurrentScreen, resetAllState, forcePathPlayerMapUpdate} from '../actions'

import Timer from './Timer'
import GameBackground from './GameBackground'
import Player from './Player'
import Pause from './Pause'

class GamePlayScreen extends Component {

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
      <>
        <Timer />
        <GameBackground />
        {this.props.isPaused ? <Pause /> : null}
        <Player />
      </>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    canvas: state.canvas,
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
