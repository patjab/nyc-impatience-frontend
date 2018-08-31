import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { touristDensity } from '../setupData'

import Tourist from './Tourist'
import Timer from './Timer'
import Path from './Path'
import Player from './Player'

class GamePlayScreen extends Component {
  renderTourists = (numberOfTourists) => {
    let tourists = []
    if (this.props.lives > 0) {
      for ( let i = 0; i < (numberOfTourists+this.props.stage); i++ ) {
        if ( !this.props.garbageOfTourists.includes(i) ) {
          tourists.push(<Tourist key={i} id={i} />)
        }
        else {
          numberOfTourists++
        }
      }
    }
    return tourists
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
    lives: state.lives,
    garbageOfTourists: state.garbageOfTourists,
    stage: state.stage
  }
}

export default connect(mapStateToProps)(GamePlayScreen)
