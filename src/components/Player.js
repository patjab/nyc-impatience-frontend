import React, { Component } from 'react'
import { connect } from 'react-redux'

import { movePlayer, changeSpeed, setPlayer, setChangeInDirection, modifyPatience } from '../actions'
import { shiftingSpeed, initialPlayerSize, playerStartY, canvasWidth, releaseCriteriaImpatience, waitingImpatience } from '../setupData'
import { pixelLengthOfBrickPath } from '../AuxiliaryMath'

class Player extends Component {
  diagonalMapSimultaneous = []
  stillHoldingUp = false
  goodForMultipleUps = false

  state = {
    walkingCycle: 0,
    // walkingCollection: ['../player/0.png', '../player/0.png', '../player/1.png', '../player/1.png'],
    walkingCollection: ['https://image.ibb.co/dP6zme/player0.png', 'https://image.ibb.co/euBX6e/player1.png'],
    changeInDirectionCounter: 0
  }

  handleWalking = (e) => {
    if (!this.props.gameOver) {
      this.diagonalMapSimultaneous[e.keyCode] = e.type === 'keydown'
      this.setState({walkingCycle: (this.state.walkingCycle+1) % this.state.walkingCollection.length})

      // REMEMBER TO FIX - MAKE SURE FUNCTION ONLY CHANGES STATE IN RESPONSE TO ARROW KEYS AND NOTHING ELSE
      this.stillHoldingUp = e.keyCode === 38 ? true : false

      const upperLeft = this.diagonalMapSimultaneous[37] && this.diagonalMapSimultaneous[38]
      const upperRight = this.diagonalMapSimultaneous[38] && this.diagonalMapSimultaneous[39]

      if (!this.props.bumpingShake && (((!upperLeft && !upperRight) && (e.keyCode > 36 && e.keyCode < 41)) || (e.key === 's')) ) {
        e.preventDefault()
        if (e.keyCode === 37 && this.props.player.xPosition > 0) {
          if ( this.props.player.xPosition > ((canvasWidth - pixelLengthOfBrickPath(playerStartY))/ 2) + 0.50*initialPlayerSize ) {
            this.props.moveLeft()
          }
        }
        else if (e.keyCode === 38) { this.props.moveUp() }
        else if (e.keyCode === 39 && this.props.player.xPosition < this.props.canvas.width) {
          if ( this.props.player.xPosition + initialPlayerSize < ((canvasWidth - pixelLengthOfBrickPath(playerStartY))/ 2) + pixelLengthOfBrickPath(playerStartY) + 0.50*initialPlayerSize ) {
            this.props.moveRight()
          }
        }
        else if (e.keyCode === 40) { this.props.moveDown() }
        else if (e.key === 's') { this.props.speed === 1 ? this.props.changeSpeed(1.5) : this.props.changeSpeed(1) }
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
    if ( e.keyCode >= 37 && e.keyCode <= 40) {
        this.setState({changeInDirectionCounter: this.state.changeInDirectionCounter+1}, ()=> {
          this.props.modifyPatience(releaseCriteriaImpatience)

          const previousMovement = this.props.movement
          const impatientWait = setInterval(() => {
            setTimeout(() => {
              if ( this.props.movement !== 0 && this.props.movement === previousMovement ) {
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
        })
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
    this.props.setPlayer(this)
  }

  componentDidUpdate() {
    const ctx = this.props.canvas.getContext("2d")
    this.refs.playerImg.src = this.state.walkingCollection[this.state.walkingCycle]
    ctx.drawImage(this.refs.playerImg, this.props.player.xPosition, this.props.player.yPosition, initialPlayerSize, initialPlayerSize)
  }

  componentWillUnmount() {
    this.props.setChangeInDirection(this.state.changeInDirectionCounter)
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
    movement: state.movement
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    moveUp: () => dispatch(movePlayer(0, 1)),
    moveDown: () => dispatch(movePlayer(0, -1)),
    moveLeft: () => {dispatch(movePlayer(-shiftingSpeed, 0))},
    moveRight: () => {dispatch(movePlayer(shiftingSpeed, 0))},
    moveUpLeft: () => dispatch(movePlayer(-shiftingSpeed, 1)),
    moveUpRight: () => dispatch(movePlayer(shiftingSpeed, 1)),
    changeSpeed: (speed) => dispatch(changeSpeed(speed)),
    setPlayer: (player) => dispatch(setPlayer(player)),
    setChangeInDirection: (count) => dispatch(setChangeInDirection(count)),
    modifyPatience: (modifier) => dispatch(modifyPatience(modifier))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Player)
