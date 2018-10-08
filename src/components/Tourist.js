import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

import { initialPlayerSize, canvasHeight, rendingTouristRowsPercentage,
  touristRunningMilliseconds, collidedImpatience, heightOfMap, startTouristMovementAtDistance, yNearnessSpook, canvasWidth } from '../setupData'
import { tourist1, tourist2, tourist3 } from '../images'
import { addTouristToGarbage, addTouristToRoaster, removeTouristFromRoaster,
  resetPlayer, recordStreak, forcePathPlayerMapUpdate,
  changeMovementAbility, toggleBumpingShake, addToBumpedImages, modifyPatience, forcePathUpdate, forcePauseUpdate } from '../actions'
import { howBigShouldIBe } from '../AuxiliaryMath'

const Tourist = class extends Component {
  state = {
    positionX: null,
    positionY: null,
    initialRow: null,
    positionOnArray: null,
    image: Math.trunc(Math.random() * 3),
    images: [tourist1, tourist2, tourist3],
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

  renderEnvironmentWithOngoingAnimation = () => {
    for ( let tourist of this.props.touristRoaster ) {
      tourist.setState({touristUpdater: tourist.state.touristUpdater+1}, this.props.forcePauseUpdate)
    }
    this.props.forcePathPlayerMapUpdate()
    this.setState({touristUpdater: this.state.touristUpdater+1}, this.props.forcePauseUpdate)
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
          this.renderEnvironmentWithOngoingAnimation()
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

    let bumpOnTheLeft = (lowerLeftPlayer.x >= lowerLeftTourist.x && lowerLeftPlayer.x <= lowerRightTourist.x)
    let bumpOnTheRight = (lowerRightPlayer.x >= lowerLeftTourist.x && lowerRightPlayer.x <= lowerRightTourist.x)

    const lowerPlayer = this.props.playerY + initialPlayerSize
    const lowerTourist = this.state.positionY + sizeOfSide

    const pixelsPerBrickAtLowerPlayer = 20

    const upperTourist = lowerTourist - (pixelsPerBrickAtLowerPlayer * this.props.movementPerBrick * yNearnessSpook)

    let withinYRange = ( lowerPlayer <= lowerTourist && lowerPlayer >= upperTourist )

    if ( (bumpOnTheLeft || bumpOnTheRight) && withinYRange && !this.state.dontCallBumpAgain ) {
      this.props.modifyPatience(collidedImpatience)
      this.runBumpAnimations()
    }
  }

  takeAPictureOfCollision = () => {
    const quality = 1
    const snapshot = this.props.canvas.toDataURL("image/jpeg", quality)
    this.props.addToBumpedImages(snapshot)
  }

  runBumpAnimations = () => {
    if (!this.props.gameOver) {
      this.props.toggleBumpingShake()

      setTimeout(this.takeAPictureOfCollision, 10)

      setTimeout(()=>{
        if (!this.props.gameOver) {
          this.props.toggleBumpingShake()
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
        }
      })
    }
  }

  checkIfTouristStillInView = () => {
    if (this.state.positionY) {
      const sizeOfSide = howBigShouldIBe(this.state.positionY)
      const lowerTourist = this.state.positionY + sizeOfSide
      const endOfVisiblePath = canvasHeight - heightOfMap
      if ( lowerTourist > endOfVisiblePath ) {
        this.props.addTouristToGarbage(this.props.id)
      }
    }
  }

  makeTouristWalk = () => {
    this.walkingTouristInterval = setInterval(() => {
      const currentRow = this.state.positionOnArray.row
      const currentCol = this.state.positionOnArray.col

      const potentialCol = currentCol + Math.round((Math.random()*2)-1)
      this.setState({
        positionOnArray: {
          col: potentialCol >= 0 && potentialCol < 10 ? potentialCol : currentCol,
          row: currentRow
        }
      }, this.renderEnvironmentWithOngoingAnimation)
    }, 1000)
  }

  componentDidMount() {
    this.refs.touristImg.onload = () => {
      const sizeOfSide = howBigShouldIBe(this.state.positionY)
      try {
        if (!this.props.isPaused) {
          this.props.canvas.getContext("2d").drawImage(this.refs.touristImg, this.state.positionX, this.state.positionY, sizeOfSide, sizeOfSide)
        }
        this.props.addTouristToRoaster(this)
        if ( this.props.movement > startTouristMovementAtDistance ) {
          this.makeTouristWalk()
        }
      } catch (err) {
        console.log("CANVAS ERROR BYPASSED")
      }
    }
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.awaitingGarbage) {
      this.props.addTouristToGarbage(this.props.id)
    } else {
      if (!this.props.isPaused) {
        const sizeOfSide = howBigShouldIBe(this.state.positionY)
        this.props.canvas.getContext("2d").drawImage(this.refs.touristImg, this.state.positionX, this.state.positionY, sizeOfSide, sizeOfSide)
        this.checkForCollision()
        this.checkIfTouristStillInView()
      } 
    }
  }

  componentWillUnmount() {
    this.props.removeTouristFromRoaster(this.props.id)
    clearInterval(this.animationInterval)
    clearInterval(this.walkingTouristInterval)
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
    patience: state.patience,
    isPaused: state.isPaused
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addTouristToRoaster: (tourist) => dispatch(addTouristToRoaster(tourist)),
    removeTouristFromRoaster: (id) => dispatch(removeTouristFromRoaster(id)),
    addTouristToGarbage: (id) => dispatch(addTouristToGarbage(id)),
    resetPlayer: () => dispatch(resetPlayer()),
    recordStreak: (streak) => dispatch(recordStreak(streak)),
    forcePathPlayerMapUpdate: () => dispatch(forcePathPlayerMapUpdate()),
    changeMovementAbility: (isDisabled) => dispatch(changeMovementAbility(isDisabled)),
    toggleBumpingShake: () => dispatch(toggleBumpingShake()),
    addToBumpedImages: (image) => dispatch(addToBumpedImages(image)),
    modifyPatience: (modifier) => dispatch(modifyPatience(modifier)),
    forcePathUpdate: () => dispatch(forcePathUpdate()),
    forcePauseUpdate: () => dispatch(forcePauseUpdate())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tourist)
