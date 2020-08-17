import * as React from 'react'
import { connect } from 'react-redux'

import { canvasHeight, rendingTouristRowsPercentage,
  touristRunningMilliseconds, collidedImpatience, heightOfMap, startTouristMovementAtDistance, movementPerBrick} from '../setupData'
import { tourist1, tourist2, tourist3 } from '../images'
import { addTouristToRoaster, removeTouristFromRoaster,
  resetPlayer, recordStreak, forcePathPlayerMapUpdate,
  changeMovementAbility, toggleBumpingShake, addToBumpedImages, modifyPatience, forcePathUpdate, forcePauseUpdate, addTouristGoneCounter} from '../actions'
import { howBigShouldIBe } from '../AuxiliaryMath'
import { Dispatch } from 'redux'
import { Row } from '../utils/BrickUtils'
import { TouristUtils } from '../utils/TouristUtils'

interface TouristProps {
  brickPositions: Row[];
  movement: number;
  isPaused: boolean;
  canvas: HTMLCanvasElement;
  id: number;
  playerX: number;
  playerY: number;
  gameOver: boolean;
  patience: number;

  addTouristToRoaster: (arg: React.ReactNode) => void;
  removeTouristFromRoaster: (id: number) => void;
  addTouristGoneCounter: () => void;
  addToBumpedImages: (snapshot: string) => void;
  modifyPatience: (patience: number) => void;
  toggleBumpingShake: () => void;
  changeMovementAbility: (canMove: boolean) => void;
  resetPlayer: () => void;
  recordStreak: (movement: number) => void;
}

interface TouristState {
  positionX: null | number;
  positionY: null | number;
  initialRow: null | number;
  positionOnArray: {row: number, col: number} | null;
  image: number;
  images: string[];
  dontCallBumpAgain: boolean;
  mountedOnMovement: number | null;
  derivedStateOverride: boolean;
  awaitingGarbage: boolean;
}

class Tourist extends React.PureComponent<TouristProps, TouristState> {
  private readonly bumpSoundEl: React.RefObject<HTMLAudioElement>;
  private readonly touristImg: React.RefObject<HTMLImageElement>;

  private animationInterval: number | undefined;
  private walkingTouristInterval: number | undefined;

  public constructor(props: TouristProps) {
    super(props);
    this.bumpSoundEl = React.createRef();
    this.touristImg = React.createRef();

    const chosenRow: number = Math.trunc(Math.trunc(Math.random()*(props.brickPositions.length-1)) * rendingTouristRowsPercentage);
    const chosenCol: number = Math.trunc(Math.random()*(props.brickPositions[0].length-1));

    this.state = {
      positionX: chosenRow < 0 ? 0 : props.brickPositions[chosenRow][chosenCol].x,
      positionY: chosenRow < 0 ? 0 : props.brickPositions[chosenRow][chosenCol].y,
      initialRow: chosenRow,
      positionOnArray: {col: chosenCol, row: chosenRow},
      image: Math.trunc(Math.random() * 3),
      images: [tourist1, tourist2, tourist3],
      dontCallBumpAgain: false,
      mountedOnMovement: props.movement,
      derivedStateOverride: false,
      awaitingGarbage: false
    };
  }

  public static getDerivedStateFromProps(props: TouristProps, state: TouristState) {
    const brickTransitionHelper = TouristUtils.brickTransitionHelper(props.movement, Number(state.mountedOnMovement));
    const chosenRow = state.positionOnArray && state.derivedStateOverride ? state.positionOnArray.row : (Number(state.initialRow)+ brickTransitionHelper ) % props.brickPositions.length
    const chosenCol = state.positionOnArray ? state.positionOnArray.col : 0;

    return {
      ...state,
      positionX: chosenRow < 0 ? 0 : props.brickPositions[chosenRow][chosenCol].x,
      positionY: chosenRow < 0 ? 0 : props.brickPositions[chosenRow][chosenCol].y,
      positionOnArray: {col: chosenCol, row: chosenRow}
    }
  }

  public componentDidMount(): void {
    const touristImg = this.touristImg.current;
    if (touristImg) {
      touristImg.onload = () => {
        const sizeOfSide = howBigShouldIBe(this.state.positionY);
        try {
          if (!this.props.isPaused && this.state.positionX && this.state.positionY) {
            this.props.canvas.getContext("2d")?.drawImage(touristImg, this.state.positionX, this.state.positionY, sizeOfSide, sizeOfSide);
          }
          this.props.addTouristToRoaster(this)
          if ( this.props.movement > startTouristMovementAtDistance ) {
            this.makeTouristWalk();
          }
        } catch (err) {
          console.log("CANVAS ERROR BYPASSED");
        }
      }
    }
  }


  public componentDidUpdate(): void {
    const touristImg = this.touristImg.current;
    if (touristImg && this.state.awaitingGarbage === false) {
      if (!this.props.isPaused && this.state.positionX && this.state.positionY) {
        const sizeOfSide = howBigShouldIBe(this.state.positionY);
        this.props.canvas.getContext("2d")?.drawImage(touristImg, this.state.positionX, this.state.positionY, sizeOfSide, sizeOfSide);
        this.checkForCollision(this.state.positionX, this.state.positionY, this.props.playerX, this.props.playerY);
        this.checkIfTouristStillInView();
      }
    }
  }

  public componentWillUnmount(): void {
    this.props.removeTouristFromRoaster(this.props.id);
    clearInterval(this.animationInterval);
    clearInterval(this.walkingTouristInterval);
  }

  public render(): React.ReactElement {
    return (
      <>
        <audio src='../bump.wav' ref={this.bumpSoundEl}/>
        <img src={`${this.state.images[this.state.image]}`} ref={this.touristImg} className='hidden' alt='tourist'/>
      </>
    )
  }

  private checkForCollision = (positionX: number, positionY: number, playerX: number, playerY: number): void => {
    if ( TouristUtils.hasCollided(positionX, positionY, playerX, playerY) && !this.state.dontCallBumpAgain ) {
      this.props.modifyPatience(collidedImpatience);
      this.runBumpAnimations();
    }
  }
  
  private runningAnimation = (): void => {
    if ( this.state.positionOnArray ) {
      let currentRow = this.state.positionOnArray.row;
      let currentCol = this.state.positionOnArray.col;

      this.animationInterval = window.setInterval(() => {
        if ( this.state.positionOnArray ) {
          if ( this.state.positionOnArray.row <= 0 ) {
            clearInterval(this.animationInterval)
            this.setState({ awaitingGarbage: true }, this.props.addTouristGoneCounter);
    
          } else if ( this.state.positionOnArray.row > 0 && !this.props.isPaused ) {
            this.setState({
              positionOnArray: {
                col: currentCol,
                row: currentRow--
              },
              derivedStateOverride: true
            });
          }
        }
        
      }, touristRunningMilliseconds);

    }
  }


  private takeAPictureOfCollision = (): void => {
    const quality = 1;
    const snapshot = this.props.canvas.toDataURL("image/jpeg", quality);
    this.props.addToBumpedImages(snapshot);
  }

  private afterBumpEffects = (): void =>{
    if (!this.props.gameOver) {
      this.props.toggleBumpingShake();
      this.props.changeMovementAbility(false);
    }
  }

  private playerRecoveryEffects = (): void => {
    if (!this.props.gameOver) {
      this.runningAnimation();
      if ( this.props.patience > 0 ) {
        this.props.recordStreak(this.props.movement);
      }
      this.props.resetPlayer();
    }
  }

  private bumpSoundEffects = () => {
    const bumpSoundEl: HTMLAudioElement | null = this.bumpSoundEl.current;
    if ( bumpSoundEl ) {

      if (!bumpSoundEl.paused) {
        (bumpSoundEl.pause() as unknown as Promise<any>)
          .then(() => {
            bumpSoundEl.play();
          });
      } else {
        bumpSoundEl.play();
      }

    }
  }

  private runBumpAnimations = (): void => {
    if (!this.props.gameOver) {
      this.props.toggleBumpingShake();
      window.setTimeout(this.takeAPictureOfCollision, 10);
      window.setTimeout(this.afterBumpEffects, 1000);
      this.bumpSoundEffects();
      this.setState({dontCallBumpAgain: true}, this.playerRecoveryEffects);
    }
  }

  private checkIfTouristStillInView = (): void => {
    if (this.state.positionY) {
      const sizeOfSide = howBigShouldIBe(this.state.positionY);
      const lowerTourist = this.state.positionY + sizeOfSide;
      const endOfVisiblePath = canvasHeight - heightOfMap;
      if ( lowerTourist > endOfVisiblePath ) {
        this.setState({ awaitingGarbage: true }, this.props.addTouristGoneCounter);
      }
    }
  }

  private makeTouristWalk = (): void => {
    this.walkingTouristInterval = window.setInterval(() => {
      if ( this.state.positionOnArray ){
        const currentRow = this.state.positionOnArray.row;
        const currentCol = this.state.positionOnArray.col;

        const potentialCol = currentCol + Math.round((Math.random()*2)-1);
        this.setState({
          positionOnArray: {
            col: potentialCol >= 0 && potentialCol < 10 ? potentialCol : currentCol,
            row: currentRow
          }
        });
      }
    }, 1000)
  }

}

const mapStateToProps = (state: any) => {
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

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    addTouristToRoaster: (tourist: React.ReactNode) => dispatch(addTouristToRoaster(tourist)),
    removeTouristFromRoaster: (id: number) => dispatch(removeTouristFromRoaster(id)),
    addTouristGoneCounter: () => dispatch(addTouristGoneCounter()),
    resetPlayer: () => dispatch(resetPlayer()),
    recordStreak: (streak: number) => dispatch(recordStreak(streak)),
    forcePathPlayerMapUpdate: () => dispatch(forcePathPlayerMapUpdate()),
    changeMovementAbility: (isDisabled: boolean) => dispatch(changeMovementAbility(isDisabled)),
    toggleBumpingShake: () => dispatch(toggleBumpingShake()),
    addToBumpedImages: (image: string) => dispatch(addToBumpedImages(image)),
    modifyPatience: (modifier: number) => dispatch(modifyPatience(modifier)),
    forcePathUpdate: () => dispatch(forcePathUpdate()),
    forcePauseUpdate: () => dispatch(forcePauseUpdate())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tourist)
