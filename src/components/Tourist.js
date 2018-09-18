import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

import { initialPeopleSizes, initialPlayerSize, canvasHeight, nearnessSpook,
  rendingTouristRowsPercentage, touristRunningMilliseconds, collidedImpatience } from '../setupData'
import { tourist1, tourist2, tourist3, tourist4 } from '../images'
import { addTouristToGarbage, addTouristToRoaster, removeTouristFromRoaster,
  resetPlayer, decreaseLife, recordStreak, forceUpdateOfPathForAnimation,
  forceUpdateOfPlayerForAnimation, changeMovementAbility, toggleBumpingShake,
  addToBumpedImages, modifyPatience, forceUpdateOfMapForAnimation } from '../actions'
import { howBigShouldIBe } from '../AuxiliaryMath'

const Tourist = class extends Component {
  state = {
    positionX: null,
    positionY: null,
    initialRow: null,
    positionOnArray: null,
    image: Math.trunc(Math.random() * 4),
    images: [tourist1, tourist2, tourist3, tourist4],
    dontCallBumpAgain: false,
    mountedOnMovement: null,
    derivedStateOverride: false,
    touristUpdater: 0,
    awaitingGarbage: false
  }

  static getDerivedStateFromProps(props, state) {
    let chosenRow, chosenCol, initialRow, mountedOnMovement

    if (state.positionOnArray === null && props.centersOfBricks.length > 0 ) {
      initialRow = chosenRow = Math.trunc(Math.trunc(Math.random()*(props.centersOfBricks.length-1)) * rendingTouristRowsPercentage)
      chosenCol = Math.trunc(Math.random()*(props.centersOfBricks[0].length-1))
      mountedOnMovement = props.movement
    } else if (state.positionOnArray !== null ) {
      let brickTransitionHelper = (Math.trunc(props.movementPerBrick * (props.movement) * 0.5) * 2) - (Math.trunc(props.movementPerBrick * (state.mountedOnMovement) * 0.5) * 2)
      chosenRow = state.derivedStateOverride ? state.positionOnArray.row : (state.initialRow + brickTransitionHelper ) % props.centersOfBricks.length
      chosenCol = state.positionOnArray.col
    } else {
      return state
    }

    return {
      ...state,
      awaitingGarbage: chosenRow < 0,
      positionX: chosenRow < 0 ? 0 : props.centersOfBricks[chosenRow][chosenCol].x,
      positionY: chosenRow < 0 ? 0 : props.centersOfBricks[chosenRow][chosenCol].y,
      initialRow: initialRow || state.initialRow,
      positionOnArray: {col: chosenCol, row: chosenRow},
      mountedOnMovement: mountedOnMovement || state.mountedOnMovement
    }

  }

  runningAnimation = () => {
    const currentRow = this.state.positionOnArray.row
    const currentCol = this.state.positionOnArray.col
    let i = 1

    this.animationInterval = setInterval(() => {
      if ( this.state.positionOnArray.row <= 0 ) {
        clearInterval(this.animationInterval)
        this.props.addTouristToGarbage(this.props.id)
      } else {
        this.setState({
          positionOnArray: {
            col: currentCol,
            row: currentRow-i
          },
          derivedStateOverride: true
        }, () => {
          for ( let tourist of this.props.touristRoaster ) {
            tourist.setState({touristUpdater: tourist.state.touristUpdater+1})
          }
          this.props.forceUpdateOfPathForAnimation()
          this.props.forceUpdateOfPlayerForAnimation()
          this.props.forceUpdateOfMapForAnimation()
          this.setState({touristUpdater: this.state.touristUpdater+1})
          i += 1
        })
      }
    }, touristRunningMilliseconds)

  }

  checkForCollision = () => {
    const sizeOfSide = howBigShouldIBe(this.state.positionY)

    const lowerLeftTourist = {x: this.state.positionX, y: this.state.positionY + sizeOfSide}
    const lowerRightTourist = {x: this.state.positionX + sizeOfSide, y: this.state.positionY + sizeOfSide}
    const lowerLeftPlayer = {x: this.props.playerX, y: this.props.playerY + initialPlayerSize}
    const lowerRightPlayer = {x: this.props.playerX + initialPlayerSize, y: this.props.playerY + initialPlayerSize}

    let bumpOnTheLeft = (lowerLeftPlayer.x >= lowerLeftTourist.x && lowerLeftPlayer.x <= lowerRightTourist.x) && (Math.abs(lowerLeftPlayer.y - lowerLeftTourist.y) < nearnessSpook)
    let bumpOnTheRight = (lowerRightPlayer.x >= lowerLeftTourist.x && lowerRightPlayer.x <= lowerRightTourist.x) && (Math.abs(lowerLeftPlayer.y - lowerLeftTourist.y) < nearnessSpook)
    if ( (bumpOnTheLeft || bumpOnTheRight) && !this.state.dontCallBumpAgain ) {
      this.props.modifyPatience(collidedImpatience)
      this.runBumpAnimations()
    }
  }

  runBumpAnimations = () => {
    if (!this.props.gameOver) {
      this.props.toggleBumpingShake()

      setTimeout(()=>{
        if (!this.props.gameOver) {
          this.props.toggleBumpingShake()
          const quality = 1
          const snapshot = this.props.canvas.toDataURL("image/jpeg", quality)
          this.props.addToBumpedImages(snapshot)
          this.props.changeMovementAbility(false)
        }
      }, 1000)

      if (!this.refs.bumpSoundEl.paused) {
        this.refs.bumpSoundEl.pause().then(() => {
          this.refs.bumpSoundEl.play()
        })
      } else {
        this.refs.bumpSoundEl.play()
      }

      this.setState({dontCallBumpAgain: true}, () => {
        if (!this.props.gameOver) {
          this.runningAnimation()
          if ( this.props.patience > 0 ) {
            this.props.recordStreak(this.props.movement)
          }
          this.props.resetPlayer()
          this.props.decreaseLife()
        }
      })
    }
  }

  checkIfTouristStillInView = () => {
    if (this.state.positionY) {
      if (this.state.positionY > (canvasHeight - (initialPeopleSizes/2))) {
        this.props.addTouristToGarbage(this.props.id)
      }
    }
  }

  componentDidMount() {
    this.refs.touristImg.onload = () => {
      const sizeOfSide = howBigShouldIBe(this.state.positionY)
      try {
        this.props.canvas.getContext("2d").drawImage(this.refs.touristImg, this.state.positionX, this.state.positionY, sizeOfSide, sizeOfSide)
        this.props.addTouristToRoaster(this)
      } catch (err) {
        console.log("CANVAS ERROR BYPASSED")
      }
    }
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.awaitingGarbage) {
      this.props.addTouristToGarbage(this.props.id)
    } else {
      const sizeOfSide = howBigShouldIBe(this.state.positionY)
      this.props.canvas.getContext("2d").drawImage(this.refs.touristImg, this.state.positionX, this.state.positionY, sizeOfSide, sizeOfSide)
      this.checkForCollision()
      this.checkIfTouristStillInView()
    }
  }

  componentWillUnmount() {
    this.props.removeTouristFromRoaster(this.props.id)
    clearInterval(this.animationInterval)
  }

  render() {
    return (
      <Fragment>
        <audio src='../bump.wav' ref='bumpSoundEl'/>
        <img src={`${this.state.images[this.state.image]}`} ref='touristImg' className='hidden' alt='tourist'/>
      </Fragment>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    canvas: state.canvas,
    movement: state.movement,
    playerX: state.player.xPosition,
    playerY: state.player.yPosition,
    centersOfBricks: state.centersOfBricks,
    movementPerBrick: state.movementPerBrick,
    touristRoaster: state.touristRoaster,
    gameOver: state.gameOver,
    patience: state.patience
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addTouristToRoaster: (tourist) => dispatch(addTouristToRoaster(tourist)),
    removeTouristFromRoaster: (id) => dispatch(removeTouristFromRoaster(id)),
    addTouristToGarbage: (id) => dispatch(addTouristToGarbage(id)),
    resetPlayer: () => dispatch(resetPlayer()),
    decreaseLife: () => dispatch(decreaseLife()),
    recordStreak: (streak) => dispatch(recordStreak(streak)),
    forceUpdateOfPathForAnimation: () => dispatch(forceUpdateOfPathForAnimation()),
    forceUpdateOfPlayerForAnimation: () => dispatch(forceUpdateOfPlayerForAnimation()),
    forceUpdateOfMapForAnimation: () => dispatch(forceUpdateOfMapForAnimation()),
    changeMovementAbility: (isDisabled) => dispatch(changeMovementAbility(isDisabled)),
    toggleBumpingShake: () => dispatch(toggleBumpingShake()),
    addToBumpedImages: (image) => dispatch(addToBumpedImages(image)),
    modifyPatience: (modifier) => dispatch(modifyPatience(modifier))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tourist)
