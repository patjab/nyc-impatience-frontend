import {movementsPerStage, initialPatience} from '../setupData';
import {initialState, AppState} from './initialState';
import {ActionKeys} from './ActionKeys';
import {Actions} from './Actions';

function appReducer(state = initialState, action: Actions): AppState {
  switch(action.type) {
    case ActionKeys.ADD_TOURIST_GONE_COUNTER:
      return {
        ...state,
        touristGoneCounter: state.touristGoneCounter + 1
      }
    case ActionKeys.SET_CANVAS:
      return {
        ...state,
        canvas: action.payload
      }
    case ActionKeys.MOVE_PLAYER:
      const allowedMovement = state.movement !== 0 && state.movement + (action.payload.y * state.speed) < 0 ? 0 : state.movement + (action.payload.y * state.speed)
      return {
        ...state,
        player: {
          ...state.player,
          xPosition: state.disabled ? state.player.xPosition : state.player.xPosition + (action.payload.x)
        },
        movement: state.disabled ? state.movement : allowedMovement,
        stage: Math.trunc(allowedMovement/movementsPerStage)
      }
    case ActionKeys.CHANGE_SPEED:
      return {
        ...state,
        speed: action.payload
      }
    case ActionKeys.ADD_TOURIST_TO_ROASTER:
      return {
        ...state,
        touristRoaster: [...state.touristRoaster, action.payload]
      }
    case ActionKeys.EMPTY_TOURIST_ROASTER:
      return {
        ...state,
        touristRoaster: []
      }
    case ActionKeys.REMOVE_TOURIST_FROM_ROASTER:
      return {
        ...state,
        touristRoaster: state.touristRoaster.filter(tourist => action.payload !== tourist.props.id)
      }
    case ActionKeys.RESET_PLAYER:
      return {
        ...state,
        disabled: true
      }
    case ActionKeys.RECORD_STREAK:
      return {
        ...state,
        streak: [...state.streak, action.payload]
      }
    case ActionKeys.CHANGE_MOVEMENT_ABILITY:
      return {
        ...state,
        disabled: action.payload
      }
    case ActionKeys.TOGGLE_BUMPING_SHAKE:
      return {
        ...state,
        bumpingShake: !state.bumpingShake
      }
    case ActionKeys.SET_GAME_OVER:
      return {
        ...state,
        gameOver: true
      }
    case ActionKeys.SET_GAME_OVER_IMAGE:
      return {
        ...state,
        gameOverImage: action.payload
      }
    case ActionKeys.ADD_TO_BUMPED_IMAGES:
      return {
        ...state,
        bumpedImages: [...state.bumpedImages, action.payload]
      }
    case ActionKeys.RECORD_TIME_FINISHED:
      return {
        ...state,
        timeFinished: action.payload
      }
    case ActionKeys.ADD_TO_CHANGE_IN_DIRECTION:
      return {
        ...state,
        changeInDirectionCounter: state.changeInDirectionCounter + 1
      }
    case ActionKeys.SET_NAME:
      return {
        ...state,
        dataToBeRecorded: {
          ...state.dataToBeRecorded,
          Name: action.payload
        }
      }
    case ActionKeys.RECORD_GAME_STATISTICS:
      return {
        ...state,
        dataToBeRecorded: {
          ...state.dataToBeRecorded,
          ...action.payload
        }
      }
    case ActionKeys.CHANGE_CURRENT_SCREEN:
      return {
        ...state,
        currentScreen: action.payload
      }
    case ActionKeys.MODIFY_PATIENCE:
      return {
        ...state,
        patience: state.patience + action.payload > 0 ? ( state.patience + action.payload > initialPatience ? initialPatience : ( state.isPaused ? state.patience : (state.patience + action.payload))) : 0
      }
    case ActionKeys.SIGNAL_DONE_RECORDING:
      return {
        ...state,
        doneRecording: true
      }
    case ActionKeys.RECORD_TIME_OF_YELL:
      return {
        ...state,
        timeOfYell: action.payload
      }
    case ActionKeys.RECORD_TIME_OF_RUN:
      return {
        ...state,
        timeOfRun: action.payload
      }
    case ActionKeys.SIGNAL_START_GAME:
      return {
        ...state,
        gameStarted: true
      }
    case ActionKeys.RECORD_FOR_BONUS:
      return {
        ...state,
        recordForBonus: [...state.recordForBonus, action.payload]
      }
    case ActionKeys.INCREMENT_TIME:
      return {
        ...state,
        time: action.payload
      }
    case ActionKeys.SET_BACKGROUND_MUSIC_REF:
      return {
        ...state,
        backgroundMusic: action.payload
      }
    case ActionKeys.SET_RUNNING_MUSIC_REF:
      return {
        ...state,
        runningMusic: action.payload
      }
    case ActionKeys.SET_SNOW_MUSIC_REF:
      return {
        ...state,
        snowMusic: action.payload
      }
    case ActionKeys.CHANGE_WEATHER:
      return {
        ...state,
        weather: action.payload
      }
    case ActionKeys.ADD_TO_SNOW_ABILITY_LIST:
      return {
        ...state,
        snowAbilityList: [...state.snowAbilityList, action.payload]
      }
    case ActionKeys.USE_SNOW_ABILITY:
      const usedList = state.snowAbilityList.filter(record => !!record.used)
      const unusedList = state.snowAbilityList.filter(record => !record.used)
      return {
        ...state,
        snowAbilityList: [
          ...usedList,
          {movement: unusedList[0].movement, used: true},
          ...unusedList.slice(1)
        ]
      }
    case ActionKeys.CHANGE_PAUSE_STATUS:
      return {
        ...state,
        isPaused: !state.isPaused,
        timePaused: !state.isPaused ? new Date() : state.timePaused,
        totalPausedTime: state.isPaused ? Number(state.totalPausedTime) + ((new Date() as unknown as number) - (state.timePaused as unknown as number)) : state.totalPausedTime
      }
    case ActionKeys.RESET_ALL_STATE:
      return {
        ...initialState
      }
    default:
      return state
  }
}

export default appReducer
