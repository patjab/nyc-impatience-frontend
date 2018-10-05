import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { touristDensity } from '../setupData'
import { changePauseStatus, changeCurrentScreen, resetAllState } from '../actions'

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

  handlePause = (e) => {
    if (e.key === 'q') {
      if (this.props.isPaused) {
        window.removeEventListener('keydown', this.handleExitAfterPause)
        this.props.backgroundMusic.play()
      } else {
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
    garbageOfTourists: state.garbageOfTourists,
    stage: state.stage,
    backgroundMusic: state.backgroundMusic,
    isPaused: state.isPaused
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    changePauseStatus: () => dispatch(changePauseStatus()),
    changeCurrentScreen: (screen) => dispatch(changeCurrentScreen(screen)),
    resetAllState: () => dispatch(resetAllState())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GamePlayScreen)
