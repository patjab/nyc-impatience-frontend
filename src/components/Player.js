import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

import {Actions} from '../store/Actions';
import { shiftingSpeed, initialPlayerSize, playerStartY, canvasWidth,
  releaseCriteriaImpatience, waitingImpatience, movingQuicklyPatience,
  movingQuicklySecondsRequirement, walking, maximumSecondsOfRunning,
  maximumSecondsOfRecharge } from '../setupData'
import { playerStepBigRight, playerStepBigLeft } from '../images'
import { pixelLengthOfBrickPath } from '../AuxiliaryMath'

class Player extends Component {
  diagonalMapSimultaneous = []
  stillHoldingUp = false
  goodForMultipleUps = false

  state = {
    walkingCycle: 0,
    walkingCollection: [playerStepBigRight, playerStepBigRight, playerStepBigLeft, playerStepBigLeft],
    changeInDirectionCounter: 0
  }

  setBackToWalking = () => {
    if (this.refs.runSoundEffectMusic) {
      this.props.changeSpeed(walking)
      this.refs.runSoundEffectMusic.pause()
      if ( !this.props.isPaused && this.props.backgroundMusic ) {
        this.props.backgroundMusic.play()
      }
    }
  }


  handleRunning = (e) => {
    const timePassedSinceRun = (this.props.time/1000) - this.props.timeOfRun
    if ( timePassedSinceRun > maximumSecondsOfRecharge  ) {
      this.props.recordTimeOfRun(this.props.time/1000)
      this.props.changeSpeed(2 * walking)
      if (this.props.backgroundMusic) {
        this.props.backgroundMusic.pause()
      }
      this.refs.runSoundEffectMusic.currentTime = 0
      this.refs.runSoundEffectMusic.play()
      setTimeout(this.setBackToWalking, maximumSecondsOfRunning * 1000)
    }
    window.addEventListener('keyup', this.runningRelease)
  }

  runningRelease = (e) => {
    if (e.key === 's') {
      this.setBackToWalking()
      window.removeEventListener('keyup', this.runningRelease)
    }
  }

  handleWalking = (e) => {
    if ( this.props.isPaused ) {
      for ( let i = 37; i < 40; i++ ) {
        this.diagonalMapSimultaneous[i] = false
      }
    }

    if (!this.props.gameStarted && e.keyCode === 38) {
      this.props.signalStartGame()
    }

    if (!this.props.gameOver && !this.props.isPaused) {
      this.diagonalMapSimultaneous[e.keyCode] = e.type === 'keydown'
      this.stillHoldingUp = e.keyCode === 38 ? true : false

      const sPressed = e.key === 's'
      const arrowPressed = e.keyCode > 36 && e.keyCode < 41
      if (!this.props.bumpingShake ) {

        if (arrowPressed || sPressed) {
          e.preventDefault()
          if (sPressed ) {
            this.handleRunning(e)
          }
        }

      }
    }
  }

  syntheticListenerForRelease = () => {
    if (!this.props.gameOver && !this.props.isPaused) {
      const eventsPerSecond = 27
      const syntheticConstant = 1000/eventsPerSecond
      this.syntheticInterval = setInterval(this.applyMovement, syntheticConstant)
    }
  }

  applyMovement = () => {
    if ( !this.props.isPaused ) {
      const leftPressed = this.diagonalMapSimultaneous[37]
      const rightPressed = this.diagonalMapSimultaneous[39]
      const upPressed = this.diagonalMapSimultaneous[38]
      const downPressed = this.diagonalMapSimultaneous[40]

      const upperLeftPressed = leftPressed && upPressed
      const upperRightPressed = upPressed && rightPressed
      const simultaneousKeyPress = upperLeftPressed || upperRightPressed

      const withinLeftBound = this.props.player.xPosition > ((canvasWidth - pixelLengthOfBrickPath(playerStartY))/ 2) + 0.50*initialPlayerSize
      const withinRightBound = this.props.player.xPosition + initialPlayerSize < ((canvasWidth - pixelLengthOfBrickPath(playerStartY))/ 2) + pixelLengthOfBrickPath(playerStartY) + 0.50*initialPlayerSize

      if ( upperLeftPressed && withinLeftBound ) { this.props.moveUpLeft() }
      else if ( upperRightPressed && withinRightBound ) { this.props.moveUpRight() }
      else if ( leftPressed && withinLeftBound && !simultaneousKeyPress) { this.props.moveLeft() }
      else if ( rightPressed && withinRightBound && !simultaneousKeyPress ) { this.props.moveRight() }
      else if ( upPressed && !simultaneousKeyPress ) { this.props.moveUp() }
      else if ( downPressed && this.props.movement > 0  ) { this.props.moveDown() }
      else if (!this.props.bumpingShake && this.goodForMultipleUps && !this.diagonalMapSimultaneous[37] && this.diagonalMapSimultaneous[38] && !this.diagonalMapSimultaneous[39] ) {
        this.props.moveUp()
      }

      if ( leftPressed || rightPressed || upPressed || downPressed ) {
        this.setState({walkingCycle: (this.state.walkingCycle+1) % this.state.walkingCollection.length})
      }
    }
  }

  releaseCriteria = (e) => {
    if ( e.keyCode >= 37 && e.keyCode <= 40 && !this.props.isPaused) {

      if ( this.props.gameStarted ) {
        this.props.addToChangeInDirection()
        this.props.modifyPatience(releaseCriteriaImpatience)
      }

      const previousMovement = this.props.movement
      const impatientWait = setInterval(() => {
        setTimeout(() => {
          if ( this.props.gameStarted && this.props.movement === previousMovement ) {
            this.props.modifyPatience(waitingImpatience)
          } else {
            clearInterval(impatientWait)
          }
        })
      }, 2000)
      this.highestImpatientInterval = impatientWait

      if (!this.props.gameOver && !this.props.isPaused) {
        this.diagonalMapSimultaneous[e.keyCode] = e.type === 'keydown'
        this.setState({walkingCycle: (this.state.walkingCycle+1) % this.state.walkingCollection.length})
        this.stillHoldingUp = e.key !== 'ArrowUp'

        if (!this.props.bumpingShake && ((e.key === 'ArrowLeft' && this.stillHoldingUp) || (e.key === 'ArrowRight' && this.stillHoldingUp)) ) {
          this.goodForMultipleUps = true
        } else if (!this.props.bumpingShake && e.key === 'ArrowUp') {
          this.goodForMultipleUps = false
        }
      } else if (this.props.isPaused) {
        this.goodForMultipleUps = false
      }

    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleWalking)
    this.syntheticListenerForRelease()
    window.addEventListener('keyup', this.releaseCriteria)

    this.props.setRunningMusicRef(this.refs.runSoundEffectMusic)

    this.refs.playerImg.onload = () => {
      const ctx = this.props.canvas.getContext("2d")

      if (this.refs.playerImg && ctx) {
        ctx.drawImage(this.refs.playerImg, this.props.player.xPosition, this.props.player.yPosition, initialPlayerSize, initialPlayerSize)
      }
    }
  }

  componentDidUpdate() {
    const ctx = this.props.canvas.getContext("2d")
    this.refs.playerImg.src = this.state.walkingCollection[this.state.walkingCycle]
    ctx.drawImage(this.refs.playerImg, this.props.player.xPosition, this.props.player.yPosition, initialPlayerSize, initialPlayerSize)

    const bonusRecord = this.props.bonusRecord
    const lastRecord = bonusRecord[bonusRecord.length - 1]

    if ( this.props.movement > lastRecord.movement + 1000 ) {
      if ( (this.props.time/1000) - (lastRecord.time) < movingQuicklySecondsRequirement ) {
        this.props.modifyPatience(movingQuicklyPatience)
      }
      this.props.recordForBonus({movement: lastRecord.movement + 1000, time: this.props.time/1000})
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleWalking)
    window.removeEventListener('keyup', this.releaseCriteria)
    window.removeEventListener('keyup', this.runningRelease)
    clearInterval(this.syntheticInterval)
    for (let i = 0; i <= this.highestImpatientInterval; i++) {
      clearInterval(i)
    }
  }

  render() {
    const currentImageSrc = this.state.walkingCollection[this.state.walkingCycle]
    return (
      <Fragment>
        <audio src='../runSoundEffect.mp3' ref='runSoundEffectMusic' />
        <img src={currentImageSrc} ref='playerImg' className='hidden' alt='player'/>
      </Fragment>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    canvas: state.canvas,
    player: state.player,
    speed: state.speed,
    bumpingShake: state.bumpingShake,
    gameOver: state.gameOver,
    movement: state.movement,
    gameStarted: state.gameStarted,
    bonusRecord: state.recordForBonus,
    backgroundMusic: state.backgroundMusic,
    timeOfRun: state.timeOfRun,
    isPaused: state.isPaused,
    time: state.time // FIX - find a more efficient way of rendering independent of state.time since time is only used for recording, but not rendering (maybe shouldComponentUpdate)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    moveUp: () => dispatch(Actions.movePlayer(0, 1)),
    moveDown: () => dispatch(Actions.movePlayer(0, -1)),
    moveLeft: () => dispatch(Actions.movePlayer(-shiftingSpeed, 0)),
    moveRight: () => dispatch(Actions.movePlayer(shiftingSpeed, 0)),
    moveUpLeft: () => dispatch(Actions.movePlayer(-shiftingSpeed, 1)),
    moveUpRight: () => dispatch(Actions.movePlayer(shiftingSpeed, 1)),
    changeSpeed: (speed) => dispatch(Actions.changeSpeed(speed)),
    modifyPatience: (modifier) => dispatch(Actions.modifyPatience(modifier)),
    signalStartGame: () => dispatch(Actions.signalStartGame()),
    recordForBonus: (record) => dispatch(Actions.recordForBonus(record)),
    addToChangeInDirection: () => dispatch(Actions.addToChangeInDirection()),
    recordTimeOfRun: (time) => dispatch(Actions.recordTimeOfRun(time)),
    setRunningMusicRef: (musicRef) => dispatch(Actions.setRunningMusicRef(musicRef))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Player)
