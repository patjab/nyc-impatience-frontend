import * as React from 'react';
import {connect} from 'react-redux';
import {touristRunningMilliseconds, collidedImpatience} from '../setupData';
import {Actions} from '../store/Actions';
import {howBigShouldIBe} from '../AuxiliaryMath';
import {Dispatch} from 'redux';
import {Row} from '../utils/BrickUtils';
import {TouristUtils, PositionOnArray} from '../utils/TouristUtils';
import {AppState} from '../store/initialState';
import {TouristStageImpl, TouristStage} from '../utils/TouristStageUtils';

interface TouristProps {
  brickPositions: Row[];
  movement: number;
  isPaused: boolean;
  canvas: HTMLCanvasElement | null;
  id: number;
  playerX: number;
  playerY: number;
  gameOver: boolean;
  patience: number;

  addTouristToRoaster: (arg: React.Component<any>) => void;
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
  positionX: number;
  positionY: number;
  positionOnArray: PositionOnArray;
  allowTouristToRun: boolean;
  stage: TouristStageImpl;
}

type TouristLifecycleFunction = (positionX: number, positionY: number, positionOnArray: PositionOnArray) => void;

class Tourist extends React.Component<TouristProps, TouristState> {
  private readonly bumpSoundEl: React.RefObject<HTMLAudioElement>;
  private readonly touristImg: React.RefObject<HTMLImageElement>;
  private readonly movementPositionOnMounted: number;
  private readonly touristLifecycleMap: Map<TouristStage, TouristLifecycleFunction>;
  private readonly initialRow: number;
  private readonly touristImgSrc: string;

  private animationInterval: number | undefined;
  private walkingTouristInterval: number | undefined;

  public constructor(props: TouristProps) {
    super(props);

    const {chosenRow, chosenCol} = TouristUtils.chooseRandomPosition(props.brickPositions);

    this.bumpSoundEl = React.createRef();
    this.touristImg = React.createRef();
    this.movementPositionOnMounted = props.movement;
    this.initialRow = chosenRow;
    this.touristImgSrc = TouristUtils.getTouristImages(Math.trunc(Math.random() * 3));

    this.touristLifecycleMap = new Map<TouristStage, TouristLifecycleFunction>([
      [
        TouristStage.NORMAL, 
        (positionX: number, positionY: number, positionOnArray: PositionOnArray) => {
          this.onCollisionAction(positionX, positionY, positionOnArray);
          this.checkDisappearance(positionX, positionY, positionOnArray);
        }
      ],
      [
        TouristStage.COLLIDED, 
        (positionX: number, positionY: number, positionOnArray: PositionOnArray) => {
          this.postCollisionAction(positionX, positionY, positionOnArray);
          this.checkDisappearance(positionX, positionY, positionOnArray);
        }
      ],
      [
        TouristStage.RUNNING, 
        (positionX: number, positionY: number, positionOnArray: PositionOnArray) => {
          this.checkDisappearance(positionX, positionY, positionOnArray);
        }
      ],
      [
        TouristStage.GONE, 
        (positionX: number, positionY: number, positionOnArray: PositionOnArray) => {
          return this.goneAction(positionX, positionY, positionOnArray);
        }
      ]
    ]);

    this.state = {
      positionX: chosenRow < 0 ? 0 : props.brickPositions[chosenRow][chosenCol].x,
      positionY: chosenRow < 0 ? 0 : props.brickPositions[chosenRow][chosenCol].y,
      positionOnArray: {col: chosenCol, row: chosenRow},
      allowTouristToRun: false,
      stage: new TouristStageImpl()
    };
  }

  goneAction = (positionX: number, positionY: number, positionOnArray: PositionOnArray) => {
    return this.props.addTouristGoneCounter();
  }

  onCollisionAction = (positionX: number, positionY: number, positionOnArray: PositionOnArray) => {
    if ( TouristUtils.hasCollided(positionX, positionY, this.props.playerX, this.props.playerY) ) {
      return this.setState({ stage: this.state.stage.next() });
    }     
  }

  postCollisionAction = (positionX: number, positionY: number, positionOnArray: PositionOnArray) => {
    this.playerCollision(positionOnArray);
    return this.setState({ stage: this.state.stage.next() });
  }

  checkDisappearance = (positionX: number, positionY: number, positionOnArray: PositionOnArray) => {
    if ( !TouristUtils.isTouristInView(positionY) ) {
      window.clearInterval(this.animationInterval);
      return this.setState({ stage: this.state.stage.onDisappear() });
    }
  }

  public componentDidUpdate() {
    const {positionY, positionX, positionOnArray} = TouristUtils.convertRowColToXY(this.props.brickPositions, this.props.movement, this.movementPositionOnMounted, this.state.positionOnArray, this.initialRow, this.state.allowTouristToRun);
    const touristImg = this.touristImg.current;
    const sizeOfSide = howBigShouldIBe(positionY);

    if (touristImg && !this.props.gameOver && !this.props.isPaused) {
      this.props.canvas?.getContext("2d")?.drawImage(touristImg, positionX, positionY, sizeOfSide, sizeOfSide);
      const lifecycleFunction: TouristLifecycleFunction = this.touristLifecycleMap.get(this.state.stage.getCurrent() as TouristStage) as TouristLifecycleFunction;
      lifecycleFunction(positionX, positionY, positionOnArray);
    }
  }
  
  public componentWillUnmount(): void {
    this.props.removeTouristFromRoaster(this.props.id);
    window.clearInterval(this.animationInterval);
    window.clearInterval(this.walkingTouristInterval);
  }

  public render(): React.ReactElement {
    return (
      <>
        <audio 
          src={'../bump.wav'}
          ref={this.bumpSoundEl}
        />
        <img 
          src={this.touristImgSrc} 
          ref={this.touristImg} 
          className={'hidden'}
          alt={'tourist'}
        />
      </>
    )
  }

  private playerCollision = (positionOnArray: PositionOnArray): void => {
    this.props.modifyPatience(collidedImpatience);
    this.props.toggleBumpingShake();
    this.bumpSoundEffects();
    window.setTimeout(this.takeAPictureOfCollision, 10);
    window.setTimeout(this.afterBumpEffects, 1000);

    this.runningAnimation(positionOnArray);
    if ( this.props.patience > 0 ) {
      this.props.recordStreak(this.props.movement);
    }
    this.props.resetPlayer();
  }
  
  private runningAnimation = (positionOnArray: PositionOnArray): void => {
    this.animationInterval = window.setInterval(() => {
      if ( positionOnArray.row > 0 && !this.props.isPaused ) {
        this.setState({
          positionOnArray: {
            col: positionOnArray.col,
            row: positionOnArray.row--
          },
          allowTouristToRun: true
        });
      }
    }, touristRunningMilliseconds);
  }

  private takeAPictureOfCollision = (): void => {
    const quality = 1;
    const snapshot = this.props.canvas?.toDataURL("image/jpeg", quality);
    if (snapshot) {
      this.props.addToBumpedImages(snapshot);
    }
  }

  private afterBumpEffects = (): void =>{
    if (!this.props.gameOver) {
      this.props.changeMovementAbility(false);
      this.props.toggleBumpingShake();
    }
  }

  private bumpSoundEffects = () => {
    const bumpSoundEl: HTMLAudioElement | null = this.bumpSoundEl.current;
    if ( bumpSoundEl ) {
      if (!bumpSoundEl.paused) {
        bumpSoundEl.pause();
        //   .then(() => {
        //     bumpSoundEl.play();
        //  });
      } else {
        bumpSoundEl.play();
      }
    }
  }

}

const mapStateToProps = (state: AppState) => {
  return {
    canvas: state.canvas,
    movement: state.movement,
    playerX: state.player.xPosition,
    playerY: state.player.yPosition,
    gameOver: state.gameOver,
    patience: state.patience,
    isPaused: state.isPaused
 }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    addTouristToRoaster: (tourist: React.Component<any>) => dispatch(Actions.addTouristToRoaster(tourist)),
    removeTouristFromRoaster: (id: number) => dispatch(Actions.removeTouristFromRoaster(id)),
    addTouristGoneCounter: () => dispatch(Actions.addTouristGoneCounter()),
    resetPlayer: () => dispatch(Actions.resetPlayer()),
    recordStreak: (streak: number) => dispatch(Actions.recordStreak(streak)),
    changeMovementAbility: (isDisabled: boolean) => dispatch(Actions.changeMovementAbility(isDisabled)),
    toggleBumpingShake: () => dispatch(Actions.toggleBumpingShake()),
    addToBumpedImages: (image: string) => dispatch(Actions.addToBumpedImages(image)),
    modifyPatience: (modifier: number) => dispatch(Actions.modifyPatience(modifier)),
 }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tourist);