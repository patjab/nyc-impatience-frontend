import React, { Component } from 'react'
import { connect } from 'react-redux'

import { initialPlayerSize, canvasHeight, rendingTouristRowsPercentage,
  touristRunningMilliseconds, collidedImpatience, heightOfMap, startTouristMovementAtDistance, yNearnessSpook, movementPerBrick} from '../setupData'
import { tourist1, tourist2, tourist3 } from '../images'
import { addTouristToRoaster, removeTouristFromRoaster,
  resetPlayer, recordStreak, forcePathPlayerMapUpdate,
  changeMovementAbility, toggleBumpingShake, addToBumpedImages, modifyPatience, forcePathUpdate, forcePauseUpdate, addTouristGoneCounter} from '../actions'
import { howBigShouldIBe } from '../AuxiliaryMath'

class Tourist extends Component {
  constructor(props) {
    super(props);
    this.bumpSoundEl = React.createRef();
    this.touristImg = React.createRef();
    this.state = {
      positionX: null,
      positionY: null,
      initialRow: null,
      positionOnArray: null,
      image: Math.trunc(Math.random() * 3),
      images: [tourist1, tourist2, tourist3],
      dontCallBumpAgain: false,
      mountedOnMovement: null,
      derivedStateOverride: false,
      awaitingGarbage: false
    };
  }



  static getDerivedStateFromProps(props, state) {
    let chosenRow, chosenCol, initialRow, mountedOnMovement
    if (state.positionOnArray === null && props.brickPositions.length > 0 ) {
      initialRow = chosenRow = Math.trunc(Math.trunc(Math.random()*(props.brickPositions.length-1)) * rendingTouristRowsPercentage)
      chosenCol = Math.trunc(Math.random()*(props.brickPositions[0].length-1))
      mountedOnMovement = props.movement
    } else if (state.positionOnArray !== null ) {
      let brickTransitionHelper = (Math.trunc(movementPerBrick * (props.movement) * 0.5) * 2) - (Math.trunc(movementPerBrick * (state.mountedOnMovement) * 0.5) * 2)
      chosenRow = state.derivedStateOverride ? state.positionOnArray.row : (state.initialRow + brickTransitionHelper ) % props.brickPositions.length
      chosenCol = state.positionOnArray.col
    } else {
      return state
    }

    return {
      ...state,
      positionX: chosenRow < 0 ? 0 : props.brickPositions[chosenRow][chosenCol].x,
      positionY: chosenRow < 0 ? 0 : props.brickPositions[chosenRow][chosenCol].y,
      initialRow: initialRow || state.initialRow,
      positionOnArray: {col: chosenCol, row: chosenRow},
      mountedOnMovement: mountedOnMovement || state.mountedOnMovement
    }

  }

  componentDidMount() {
    const touristImg = this.touristImg.current;
    if (touristImg) {
      touristImg.onload = () => {
        const sizeOfSide = howBigShouldIBe(this.state.positionY)
        try {
          if (!this.props.isPaused) {
            this.props.canvas.getContext("2d").drawImage(touristImg, this.state.positionX, this.state.positionY, sizeOfSide, sizeOfSide)
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
  }


  componentDidUpdate() {
    const touristImg = this.touristImg.current;
    if (touristImg && this.state.awaitingGarbage === false) {
      if (!this.props.isPaused) {
        const sizeOfSide = howBigShouldIBe(this.state.positionY)
        this.props.canvas.getContext("2d").drawImage(touristImg, this.state.positionX, this.state.positionY, sizeOfSide, sizeOfSide)
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
      <>
        <audio src='../bump.wav' ref={this.bumpSoundEl}/>
        <img src={`${this.state.images[this.state.image]}`} ref={this.touristImg} className='hidden' alt='tourist'/>
      </>
    )
  }

  randomSpot = () => {
    const chosenRow = Math.trunc(Math.trunc(Math.random()*(this.props.brickPositions.length-1)) * rendingTouristRowsPercentage);
    const chosenCol = Math.trunc(Math.random()*(this.props.brickPositions[0].length-1))

    return {
      positionX: chosenRow < 0 ? 0 : this.props.brickPositions[chosenRow][chosenCol].x,
      positionY: chosenRow < 0 ? 0 : this.props.brickPositions[chosenRow][chosenCol].y
    };
  }
  
  runningAnimation = () => {
    const currentRow = this.state.positionOnArray.row
    const currentCol = this.state.positionOnArray.col
    let i = 1

    this.animationInterval = setInterval(() => {
      if ( this.state.positionOnArray.row <= 0 ) {
        clearInterval(this.animationInterval)
        this.setState({ awaitingGarbage: true }, this.props.addTouristGoneCounter);

      } else if ( this.state.positionOnArray.row > 0 && !this.props.isPaused ) {
        this.setState({
          positionOnArray: {
            col: currentCol,
            row: currentRow-i
          },
          derivedStateOverride: true
        }, () => {
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

    const upperTourist = lowerTourist - (pixelsPerBrickAtLowerPlayer * movementPerBrick * yNearnessSpook)

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

      const bumpSoundEl = this.bumpSoundEl.current ;
      if ( bumpSoundEl ) {

        if (!bumpSoundEl.paused) {
          bumpSoundEl.pause().then(() => {
            bumpSoundEl.play()
          })
        } else {
          bumpSoundEl.play()
        }
  
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
        console.log(this.props.id, 'tourist gone ')
        this.setState({ awaitingGarbage: true }, this.props.addTouristGoneCounter);
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

}

const mapStateToProps = (state) => {
  return {
    canvas: state.canvas,
    movement: state.movement,
    playerX: state.player.xPosition,
    playerY: state.player.yPosition,
    
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
    addTouristGoneCounter: () => dispatch(addTouristGoneCounter()),
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
