import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { backgroundMusicOn, loudnessSpookLevel, loudnessRechargeInSeconds } from '../setupData'
import { microphoneRunner, loudEnough } from '../mediaHelper/microphoneHelper'

import GamePlayScreen from './GamePlayScreen'
import GameStatistics from './GameStatistics'
import Map from './Map'

class GamePlayContainer extends Component {
  state = {
    scaredTouristListener: null,
    playerYelled: null
  }

  backgroundMusicStart = (e) => {
    if ( e.key === 'ArrowUp' ) {
      if ( backgroundMusicOn ) {
        this.refs.backgroundMusic.play()
      }
      window.removeEventListener('keydown', this.backgroundMusicStart)
    }
  }

  scaredTouristListener = () => {
    microphoneRunner(loudnessSpookLevel)
    return setInterval( () => {
      if (loudEnough && !this.state.playerYelled ) {
        this.setState({playerYelled: true}, () => {
          for ( let tourist of this.props.touristRoaster ) {
            tourist.runningAnimation()
          }
          setTimeout( () => {
            this.setState({playerYelled: false})
          }, loudnessRechargeInSeconds * 1000)
        })
      }
    }, 1)
  }

  componentDidMount() {
    window.addEventListener('keydown', this.backgroundMusicStart)
    const scaredTouristListener = this.scaredTouristListener()
    this.setState({scaredTouristListener: scaredTouristListener})
  }

  componentDidUpdate() {
    if (this.props.timeFinished) {
      this.refs.backgroundMusic.pause()
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.scaredTouristListener)
  }

  render() {
    return (
      <Fragment>
        <audio src='../backgroundMusic.mp3' loop='true' ref='backgroundMusic'/ >
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
    gameStarted: state.gameStarted
  }
}


export default connect(mapStateToProps)(GamePlayContainer)
