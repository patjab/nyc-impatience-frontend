import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

import { movePlayer, changeSpeed, addToChangeInDirection, modifyPatience,
  signalStartGame, recordForBonus, addToSnowAbilityList,
  useSnowAbility, changeWeather, recordTimeOfRun, setRunningMusicRef } from '../actions'
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
      if ( !this.props.isPaused ) {
        this.props.backgroundMusic.play()
      }
    }
  }


  handleRunning = (e) => {
    const timePassedSinceRun = (this.props.time/1000) - this.props.timeOfRun
    if ( timePassedSinceRun > maximumSecondsOfRecharge  ) {
      this.props.recordTimeOfRun(this.props.time/1000)
      this.props.changeSpeed(2 * walking)
      this.props.backgroundMusic.pause()
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
    // Fixed the release problem after pausing that caused release to never occur
    if ( this.props.isPaused ) {
      for ( let i = 37; i < 40; i++ ) {
        this.diagonalMapSimultaneous[i] = false
      }
    }

    if (!this.props.gameStarted && e.keyCode == 38) {
      this.props.signalStartGame()
    }

    if (!this.props.gameOver && !this.props.isPaused) {
      this.diagonalMapSimultaneous[e.keyCode] = e.type === 'keydown'
      this.stillHoldingUp = e.keyCode === 38 ? true : false

      const upperLeftPressed = this.diagonalMapSimultaneous[37] && this.diagonalMapSimultaneous[38]
      const upperRightPressed = this.diagonalMapSimultaneous[38] && this.diagonalMapSimultaneous[39]
      const simultaneousKeyPress = upperLeftPressed || upperRightPressed

      const withinLeftBound = this.props.player.xPosition > ((canvasWidth - pixelLengthOfBrickPath(playerStartY))/ 2) + 0.50*initialPlayerSize
      const withinRightBound = this.props.player.xPosition + initialPlayerSize < ((canvasWidth - pixelLengthOfBrickPath(playerStartY))/ 2) + pixelLengthOfBrickPath(playerStartY) + 0.50*initialPlayerSize

      if (!this.props.bumpingShake ) {

        if (e.key === 's' && this.props.gameStarted ) { this.handleRunning(e) }
        if (e.keyCode > 36 && e.keyCode < 41) {

            e.preventDefault()
            if ( upperLeftPressed && withinLeftBound ) { this.props.moveUpLeft() }
            else if ( upperRightPressed && withinRightBound ) { this.props.moveUpRight() }
            else if (e.keyCode === 37 && withinLeftBound && !simultaneousKeyPress) { this.props.moveLeft() }
            else if (e.keyCode === 39 && withinRightBound && !simultaneousKeyPress ) { this.props.moveRight() }
            else if (e.keyCode === 38 && !simultaneousKeyPress ) { this.props.moveUp() }
            else if (e.keyCode === 40 && this.props.movement > 0  ) { this.props.moveDown() }

            this.setState({walkingCycle: (this.state.walkingCycle+1) % this.state.walkingCollection.length})

        }


      }


    }
  }

  winterMode = () => {
    if ( this.props.snowAbilityList.filter(record => record.used === false).length > 0 && this.props.weather === "SUNNY" ) {
      this.props.backgroundMusic.pause()
      this.props.snowMusic.play()
      this.props.useSnowAbility()
      this.props.changeWeather("SNOWING")
    } else if ( this.props.weather === "SNOWING" ) {
      this.props.snowMusic.pause()
      this.props.backgroundMusic.play()
      this.props.snowMusic.currentTime = 0
      this.props.changeWeather("SUNNY")
    }
  }

  syntheticListenerForRelease = () => {
    if (!this.props.gameOver && !this.props.isPaused) {
      const syntheticConstant = 1000/60
      this.syntheticInterval = setInterval(() => {
        if (!this.props.bumpingShake && this.goodForMultipleUps && this.diagonalMapSimultaneous[38] && !this.props.isPaused) {
          this.props.moveUp()
          this.setState({walkingCycle: (this.state.walkingCycle+1) % this.state.walkingCollection.length})
        }
      }, syntheticConstant)
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

    const snowRecord = this.props.snowAbilityList
    const lastSnowAbilityRecord = snowRecord[snowRecord.length - 1]

    if ( this.props.movement > lastSnowAbilityRecord.movement + 1000 ) {
      console.log("ADDED SNOW RECORD", this.props.movement)
      this.props.addToSnowAbilityList({movement: lastSnowAbilityRecord.movement + 1000, used: false})
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
    playerUpdater: state.playerUpdater,
    gameOver: state.gameOver,
    movement: state.movement,
    gameStarted: state.gameStarted,
    bonusRecord: state.recordForBonus,
    backgroundMusic: state.backgroundMusic,
    snowMusic: state.snowMusic,
    snowAbilityList: state.snowAbilityList,
    weather: state.weather,
    timeOfRun: state.timeOfRun,
    isPaused: state.isPaused,
    time: state.time // FIX - find a more efficient way of rendering independent of state.time since time is only used for recording, but not rendering (maybe shouldComponentUpdate)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    moveUp: () => dispatch(movePlayer(0, 1)),
    moveDown: () => dispatch(movePlayer(0, -1)),
    moveLeft: () => dispatch(movePlayer(-shiftingSpeed, 0)),
    moveRight: () => dispatch(movePlayer(shiftingSpeed, 0)),
    moveUpLeft: () => dispatch(movePlayer(-shiftingSpeed, 1)),
    moveUpRight: () => dispatch(movePlayer(shiftingSpeed, 1)),
    changeSpeed: (speed) => dispatch(changeSpeed(speed)),
    modifyPatience: (modifier) => dispatch(modifyPatience(modifier)),
    signalStartGame: () => dispatch(signalStartGame()),
    recordForBonus: (record) => dispatch(recordForBonus(record)),
    addToSnowAbilityList: (record) => dispatch(addToSnowAbilityList(record)),
    useSnowAbility: () => dispatch(useSnowAbility()),
    changeWeather: (weather) => dispatch(changeWeather(weather)),
    addToChangeInDirection: () => dispatch(addToChangeInDirection()),
    recordTimeOfRun: (time) => dispatch(recordTimeOfRun(time)),
    setRunningMusicRef: (musicRef) => dispatch(setRunningMusicRef(musicRef))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Player)
