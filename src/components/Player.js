import React, { Component } from 'react'
import { connect } from 'react-redux'

import { movePlayer, changeSpeed, addToChangeInDirection, modifyPatience, signalStartGame, recordForBonus, changeRunningStatus, addToSnowAbilityList, useSnowAbility, changeWeather } from '../actions'
import { shiftingSpeed, initialPlayerSize, playerStartY, canvasWidth, releaseCriteriaImpatience, waitingImpatience, movingQuicklyPatience, movingQuicklySecondsRequirement, walking, maximumSecondsOfRunning, maximumSecondsOfRecharge } from '../setupData'
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

  restAfterRunning = () => {
    this.props.changeSpeed(2 * walking)
    this.props.changeRunningStatus('RESTING')
    setTimeout(() => {
      this.props.changeRunningStatus('WAITING')
    }, maximumSecondsOfRecharge * 1000)
  }

  handleWalking = (e) => {
    if (!this.props.gameOver) {
      this.diagonalMapSimultaneous[e.keyCode] = e.type === 'keydown'
      this.setState({walkingCycle: (this.state.walkingCycle+1) % this.state.walkingCollection.length})

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
          if ( !this.props.gameStarted ) { this.props.signalStartGame() }
          this.props.moveUp()
        }
        else if (e.keyCode === 39 && this.props.player.xPosition < this.props.canvas.width ) {
          if ( this.props.player.xPosition + initialPlayerSize < ((canvasWidth - pixelLengthOfBrickPath(playerStartY))/ 2) + pixelLengthOfBrickPath(playerStartY) + 0.50*initialPlayerSize ) {
            this.props.moveRight()
          }
        }
        else if (e.keyCode === 40 && this.props.movement > 0 ) { this.props.moveDown() }
        else if (e.key === 's' && this.props.runningStatus !== 'RESTING') {

          if (this.props.speed === (2 * walking)) {
            this.props.changeSpeed(4 * walking)
            this.props.changeRunningStatus('RUNNING')

            setTimeout(() => {
              if (this.props.runningStatus === 'RUNNING') {
                this.restAfterRunning()
              }
            }, maximumSecondsOfRunning * 1000)
          } else {
            this.restAfterRunning()
          }

        }
        else if (e.key === 'd') {
          this.winterMode()
        }
        this.setState({walkingCycle: (this.state.walkingCycle+1) % this.state.walkingCollection.length})
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
    if (!this.props.gameOver) {
      const syntheticConstant = 40
      this.syntheticInterval = setInterval(() => {
        if (!this.props.bumpingShake && this.goodForMultipleUps && this.diagonalMapSimultaneous[38] ) {
          this.props.moveUp()
          this.setState({walkingCycle: (this.state.walkingCycle+1) % this.state.walkingCollection.length})
        }
      }, syntheticConstant)
    }
  }

  releaseCriteria = (e) => {
    if ( e.keyCode >= 37 && e.keyCode <= 40 ) {
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

      if (!this.props.gameOver) {
        this.diagonalMapSimultaneous[e.keyCode] = e.type === 'keydown'
        this.setState({walkingCycle: (this.state.walkingCycle+1) % this.state.walkingCollection.length})
        this.stillHoldingUp = e.key !== 'ArrowUp'

        if (!this.props.bumpingShake && ((e.key === 'ArrowLeft' && this.stillHoldingUp) || (e.key === 'ArrowRight' && this.stillHoldingUp)) ) {
          this.goodForMultipleUps = true
        } else if (!this.props.bumpingShake && e.key === 'ArrowUp') {
          this.goodForMultipleUps = false
        }
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
      console.log("CURRENT: ", this.props.time)
      console.log("LAST REC: ", lastRecord.time)

      if ( (this.props.time/1000) - (lastRecord.time) < movingQuicklySecondsRequirement ) {
        console.log("AWARDED")
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
    clearInterval(this.syntheticInterval)
    for (let i = 0; i <= this.highestImpatientInterval; i++) {
      clearInterval(i)
    }
  }

  render() {
    const currentImageSrc = this.state.walkingCollection[this.state.walkingCycle]
    return (
      <img src={currentImageSrc} ref='playerImg' className='hidden' alt='player'/>
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
    runningStatus: state.runningStatus,
    backgroundMusic: state.backgroundMusic,
    snowMusic: state.snowMusic,
    snowAbilityList: state.snowAbilityList,
    weather: state.weather,
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
    changeRunningStatus: (status) => dispatch(changeRunningStatus(status)),
    addToSnowAbilityList: (record) => dispatch(addToSnowAbilityList(record)),
    useSnowAbility: () => dispatch(useSnowAbility()),
    changeWeather: (weather) => dispatch(changeWeather(weather)),
    addToChangeInDirection: () => dispatch(addToChangeInDirection())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Player)
