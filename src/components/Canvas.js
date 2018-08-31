import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { setThisCanvas } from '../actions'
import { canvasWidth, canvasHeight } from '../setupData'

import GamePlayContainer from './GamePlayContainer'

class Canvas extends Component {
  componentDidMount() {
    this.props.setCanvas(this.refs.playArea)
  }

  render() {
    return (
      <Fragment>
        <canvas width={canvasWidth} height={canvasHeight} ref='playArea' id='playArea' className={this.props.bumpingShake ? 'bumpingShake' : null}></canvas>
        <GamePlayContainer />
      </Fragment>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    bumpingShake: state.bumpingShake
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setCanvas: (canvas) => dispatch(setThisCanvas(canvas))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Canvas)
