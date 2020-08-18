import * as React from 'react';
import {connect} from 'react-redux';
import {touristRunningMilliseconds, collidedImpatience} from '../setupData';
import {Actions} from '../store/Actions';
import {howBigShouldIBe} from '../AuxiliaryMath';
import {Dispatch} from 'redux';
import {Row} from '../utils/BrickUtils';
import {TouristUtils, PositionOnArray} from '../utils/TouristUtils';
import {AppState} from '../store/initialState';

enum TouristStage {
  NORMAL = 'NORMAL',
  COLLIDED = 'COLLIDED',
  RUNNING = 'RUNNING',
  GONE = 'GONE'
}

class TouristStageImpl {
  private static order: TouristStage[] = [
    TouristStage.NORMAL,
    TouristStage.COLLIDED,
    TouristStage.RUNNING,
    TouristStage.GONE
  ];

  private touristStages: TouristStage[];

  public constructor(startAt: TouristStage = TouristStage.NORMAL) {
    this.touristStages = TouristStageImpl.order.slice(TouristStageImpl.order.indexOf(startAt));
  }

  public getCurrent = (): TouristStage | void => {
    return this.touristStages[0];
  }

  public next = (): TouristStageImpl => {
    return new TouristStageImpl(this.touristStages[1]);
  }

  public onDisappear = (): TouristStageImpl => {
    return new TouristStageImpl(TouristStage.GONE);
  }
}

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
  positionX: null | number;
  positionY: null | number;
  positionOnArray: PositionOnArray;
  allowTouristToRun: boolean;
  stage: TouristStageImpl;
}


class Tourist extends React.Component<TouristProps, TouristState> {
  private readonly bumpSoundEl: React.RefObject<HTMLAudioElement>;
  private readonly touristImg: React.RefObject<HTMLImageElement>;
  private readonly movementPositionOnMounted: number;
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

    this.state = {
      positionX: chosenRow < 0 ? 0 : props.brickPositions[chosenRow][chosenCol].x,
      positionY: chosenRow < 0 ? 0 : props.brickPositions[chosenRow][chosenCol].y,
      positionOnArray: {col: chosenCol, row: chosenRow},
      allowTouristToRun: false,
      stage: new TouristStageImpl()
    };
  }

  // public componentDidMount(): void {
  //   const touristImg = this.touristImg.current;
  //   if (touristImg) {
  //     touristImg.onload = () => {
  //       const sizeOfSide = howBigShouldIBe(this.state.positionY);
  //       try {
  //         if (!this.props.isPaused && this.state.positionX && this.state.positionY) {
  //           this.props.canvas?.getContext("2d")?.drawImage(touristImg, this.state.positionX, this.state.positionY, sizeOfSide, sizeOfSide);
  //         }
  //         this.props.addTouristToRoaster(this);
  //         if ( this.props.movement > startTouristMovementAtDistance ) {
  //           this.makeTouristWalk();
  //         }
  //      } catch (err) {
  //         console.log("CANVAS ERROR BYPASSED");
  //      }
  //    }
  //   }
  // }

  public componentDidUpdate() {

    const {positionY, positionX} = TouristUtils.convertRowColToXY(this.props.brickPositions, this.props.movement, this.movementPositionOnMounted, this.state.positionOnArray, this.initialRow, this.state.allowTouristToRun);
    const touristImg = this.touristImg.current;
    const sizeOfSide = howBigShouldIBe(positionY);

    if (touristImg && !this.props.gameOver && !this.props.isPaused) {
      this.props.canvas?.getContext("2d")?.drawImage(touristImg, positionX, positionY, sizeOfSide, sizeOfSide);

      if ( this.state.stage.getCurrent() !== TouristStage.GONE  ) {

        if ( this.state.stage.getCurrent() !== TouristStage.RUNNING  ) {

          if ( this.state.stage.getCurrent() !== TouristStage.COLLIDED ) {

            // Collision Check (animation, logic)
            if ( TouristUtils.hasCollided(positionX, positionY, this.props.playerX, this.props.playerY) ) {
              return this.setState({ stage: this.state.stage.next() });
            } 

          } else {
            this.collideFrontAndBack();
            return this.setState({ stage: this.state.stage.next() });
          }

        } else {

        }
  
        // Disappearance Check (animation, logic)
        if ( !TouristUtils.isTouristInView(positionY) ) {
          window.clearInterval(this.animationInterval);
          this.setState({ stage: this.state.stage.onDisappear() });
        }

      } else {
        return this.props.addTouristGoneCounter();
      }

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

  private collideFrontAndBack = (): void => {
    this.props.modifyPatience(collidedImpatience);
    this.props.toggleBumpingShake();
    window.setTimeout(this.takeAPictureOfCollision, 10);
    window.setTimeout(this.afterBumpEffects, 1000);
    this.bumpSoundEffects();
    this.playerRecoveryEffects();
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
  
  private runningAnimation = (): void => {
    const {positionOnArray} = TouristUtils.convertRowColToXY(this.props.brickPositions, this.props.movement, this.movementPositionOnMounted, this.state.positionOnArray, this.initialRow, this.state.allowTouristToRun);

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
      this.props.toggleBumpingShake();
      this.props.changeMovementAbility(false);
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

//   private makeTouristWalk = (): void => {
//     this.walkingTouristInterval = window.setInterval(() => {
//       const {positionOnArray} = TouristUtils.convertRowColToXY(this.props.brickPositions, this.props.movement, this.movementPositionOnMounted, this.state.positionOnArray, this.initialRow, this.state.allowTouristToRun);
//       if ( positionOnArray ){
//         const currentRow = positionOnArray.row;
//         const currentCol = positionOnArray.col;

//         const potentialCol = currentCol + Math.round((Math.random()*2)-1);
//         this.setState({
//           positionOnArray: {
//             col: potentialCol >= 0 && potentialCol < 10 ? potentialCol : currentCol,
//             row: currentRow
//          }
//        });
//      }
//    }, 1000)
//  }

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