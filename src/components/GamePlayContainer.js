import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { backgroundMusicOn, loudnessSpookLevel, loudnessRechargeInSeconds } from '../setupData'
import { microphoneRunner, loudEnough } from '../mediaHelper/microphoneHelper'

import { signalPlayerYelled, resetPlayerYelled, setBackgroundMusicRef, toggleBackgroundMusicPlaying, setSnowMusicRef, toggleSnowMusicPlaying } from '../actions'

import GamePlayScreen from './GamePlayScreen'
import GameStatistics from './GameStatistics'
import Map from './Map'

class GamePlayContainer extends Component {
  state = {
    scaredTouristListener: null
    // playerYelled: null
  }

  backgroundMusicStart = (e) => {
    if ( e.key === 'ArrowUp' ) {
      if ( backgroundMusicOn ) {
        this.props.setBackgroundMusicRef(this.refs.backgroundMusic)
        this.props.setSnowMusicRef(this.refs.snowMusic)
        this.refs.backgroundMusic.play()
        this.props.toggleBackgroundMusicPlaying()
        // this.props.toggleSnowMusicPlaying()
      }
      window.removeEventListener('keydown', this.backgroundMusicStart)
    }
  }

  scaredTouristListener = () => {
    microphoneRunner(loudnessSpookLevel)
    return setInterval( () => {
      if (loudEnough && !this.props.playerYelled ) {
        this.props.signalPlayerYelled()
        for ( let tourist of this.props.touristRoaster ) {
          tourist.runningAnimation()
        }
        setTimeout( () => {
          this.props.resetPlayerYelled()
        }, loudnessRechargeInSeconds * 1000)
      }
    }, 100)
  }

  componentDidMount() {
    window.addEventListener('keydown', this.backgroundMusicStart)

    const scaredTouristListener = this.scaredTouristListener()
    this.setState({scaredTouristListener: scaredTouristListener})
  }

  componentDidUpdate() {
    if (this.props.timeFinished) {
      this.refs.backgroundMusic.pause()
      this.refs.snowMusic.pause()
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.scaredTouristListener)
  }

  render() {
    return (
      <Fragment>
        <audio src='../backgroundMusic.mp3' loop='true' ref='backgroundMusic' />
        <audio src='../snowMusic.mp3' loop='true' ref='snowMusic' />
        { this.props.timeFinished === null ? <GamePlayScreen /> : <GameStatistics /> }
        { this.props.gameStarted ? <Map /> : null }
      </Fragment>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    timeFinished: state.timeFinished,
    touristRoaster: state.touristRoaster,
    gameStarted: state.gameStarted,
    playerYelled: state.playerYelled
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    signalPlayerYelled: () => dispatch(signalPlayerYelled()),
    resetPlayerYelled: () => dispatch(resetPlayerYelled()),
    setBackgroundMusicRef: (musicRef) => dispatch(setBackgroundMusicRef(musicRef)),
    toggleBackgroundMusicPlaying: () => dispatch(toggleBackgroundMusicPlaying()),
    setSnowMusicRef: (musicRef) => dispatch(setSnowMusicRef(musicRef)),
    toggleSnowMusicPlaying: () => dispatch(toggleSnowMusicPlaying())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GamePlayContainer)
