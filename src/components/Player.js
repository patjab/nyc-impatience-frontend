import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

import { movePlayer, changeSpeed, addToChangeInDirection, modifyPatience,
  signalStartGame, recordForBonus, addToSnowAbilityList,
  useSnowAbility, changeWeather, recordTimeOfRun } from '../actions'
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



  handleRunning = (e) => {
    const timePassedSinceRun = (this.props.time/1000) - this.props.timeOfRun
    if ( timePassedSinceRun > maximumSecondsOfRecharge  ) {
      this.props.recordTimeOfRun(this.props.time/1000)

      this.props.changeSpeed(2 * walking)
      this.props.backgroundMusic.pause()
      this.refs.runSoundEffectMusic.currentTime = 0
      this.refs.runSoundEffectMusic.play()

      setTimeout(() => {
        if (this.refs.runSoundEffectMusic) {
          this.props.changeSpeed(walking)
          this.refs.runSoundEffectMusic.pause()
          this.props.backgroundMusic.play()
        }
      }, maximumSecondsOfRunning * 1000)
    }

    window.addEventListener('keyup', this.runningRelease)
  }

  runningRelease = (e) => {
    if (e.key === 's') {
      this.props.changeSpeed(walking)
      this.refs.runSoundEffectMusic.pause()
      this.props.backgroundMusic.play()

      window.removeEventListener('keyup', this.runningRelease)
    }
  }

  handleWalking = (e) => {
    // Fixed the release problem after pausing that caused release to never occur
    if ( this.props.isPaused ) {
      this.diagonalMapSimultaneous[37] = false
      this.diagonalMapSimultaneous[38] = false
      this.diagonalMapSimultaneous[39] = false
    }

    if (!this.props.gameOver && !this.props.isPaused) {
      this.diagonalMapSimultaneous[e.keyCode] = e.type === 'keydown'

      // REMEMBER TO FIX - MAKE SURE FUNCTION ONLY CHANGES STATE IN RESPONSE TO ARROW KEYS AND NOTHING ELSE
      this.stillHoldingUp = e.keyCode === 38 ? true : false

      const upperLeft = this.diagonalMapSimultaneous[37] && this.diagonalMapSimultaneous[38]
      const upperRight = this.diagonalMapSimultaneous[38] && this.diagonalMapSimultaneous[39]

      if (!this.props.bumpingShake && (((!upperLeft && !upperRight) && (e.keyCode > 36 && e.keyCode < 41)) || (e.key === 's') || (e.key === 'd') ) ) {
        e.preventDefault()
        if (e.keyCode === 37 && this.props.player.xPosition > 0 ) {
          if ( this.props.player.xPosition > ((canvasWidth - pixelLengthOfBrickPath(playerStartY))/ 2) + 0.50*initialPlayerSize ) {
            this.props.moveLeft()
          }
        }
        else if (e.keyCode === 38) {
          if ( !this.props.gameStarted ) {
            this.props.signalStartGame()
          }
          this.props.moveUp()
        }
        else if (e.keyCode === 39 && this.props.player.xPosition < this.props.canvas.width ) {
          if ( this.props.player.xPosition + initialPlayerSize < ((canvasWidth - pixelLengthOfBrickPath(playerStartY))/ 2) + pixelLengthOfBrickPath(playerStartY) + 0.50*initialPlayerSize ) {
            this.props.moveRight()
          }
        }
        else if (e.keyCode === 40 && this.props.movement > 0 ) { this.props.moveDown() }
        else if (e.key === 's' && this.props.gameStarted ) { this.handleRunning(e) }
        else if (e.key === 'd' && this.props.gameStarted ) { this.winterMode() }

        if (e.keyCode > 36 && e.keyCode < 41) {
          this.setState({walkingCycle: (this.state.walkingCycle+1) % this.state.walkingCollection.length})
        }
      }

      if (!this.props.bumpingShake && upperLeft) {
        if ( this.props.player.xPosition > ((canvasWidth - pixelLengthOfBrickPath(playerStartY))/ 2) + 0.50*initialPlayerSize ) {
          this.props.moveUpLeft()
        }
      }
      if (!this.props.bumpingShake && upperRight) {
        if ( this.props.player.xPosition + initialPlayerSize < ((canvasWidth - pixelLengthOfBrickPath(playerStartY))/ 2) + pixelLengthOfBrickPath(playerStartY) + 0.50*initialPlayerSize ) {
          this.props.moveUpRight()
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
      const syntheticConstant = 40
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
      this.props.addToChangeInDirection()

      if ( this.props.gameStarted ) {
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
    recordTimeOfRun: (time) => dispatch(recordTimeOfRun(time))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Player)
