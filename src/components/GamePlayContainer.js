import React, { Component } from 'react'
import { connect } from 'react-redux'
import { backgroundMusicOn, loudnessSpookLevel, loudnessRechargeInSeconds } from '../setupData'
import { microphoneRunner, loudEnough } from '../mediaHelper/microphoneHelper'

import { setBackgroundMusicRef, setSnowMusicRef, recordTimeOfYell } from '../actions'

import GamePlayScreen from './GamePlayScreen'
import GameStatistics from './GameStatistics'

class GamePlayContainer extends Component {
  state = {
    scaredTouristListener: null
  }

  backgroundMusicStart = (e) => {
    if ( e.key === 'ArrowUp' ) {
      if ( backgroundMusicOn ) {
        this.props.setBackgroundMusicRef(this.refs.backgroundMusic)
        this.props.setSnowMusicRef(this.refs.snowMusic)
        this.refs.backgroundMusic.play()
      }
      window.removeEventListener('keydown', this.backgroundMusicStart)
    }
  }

  scaredTouristListener = () => {
    microphoneRunner(loudnessSpookLevel)
    return setInterval( () => {
      const readyForYelling = (this.props.time/1000) - this.props.timeOfYell > loudnessRechargeInSeconds
      if (loudEnough && readyForYelling ) {
        this.props.recordTimeOfYell(this.props.time/1000)
        for ( let tourist of this.props.touristRoaster ) {
          tourist.runningAnimation()
        }
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
      <>
        <audio src='../backgroundMusic.mp3' loop={true} ref='backgroundMusic' />
        <audio src='../snowMusic.mp3' loop={true} ref='snowMusic' />
        { this.props.timeFinished === null ? <GamePlayScreen /> : <GameStatistics /> }
      </>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    timeFinished: state.timeFinished,
    touristRoaster: state.touristRoaster,
    // gameStarted: state.gameStarted,
    playerYelled: state.playerYelled,
    time: state.time,
    timeOfYell: state.timeOfYell
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setBackgroundMusicRef: (musicRef) => dispatch(setBackgroundMusicRef(musicRef)),
    setSnowMusicRef: (musicRef) => dispatch(setSnowMusicRef(musicRef)),
    recordTimeOfYell: (time) => dispatch(recordTimeOfYell(time))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GamePlayContainer)
