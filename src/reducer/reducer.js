import { playerStartX, playerStartY, walking, movementsPerStage, initialPatience, loudnessRechargeInSeconds, maximumSecondsOfRecharge } from '../setupData'

const initialState = {
  canvas: null,
  player: {
    xPosition: playerStartX,
    yPosition: playerStartY
  },
  movement: 0,
  movementPerBrick: walking/2,
  speed: walking,
  centersOfBricks: [],
  garbageOfTourists: [],
  touristRoaster: [],
  streak: [],
  startScreenPresent: true,
  stage: 0,
  pathUpdater: 0,
  playerUpdater: 0,
  mapUpdater: 0,
  disabled: false,
  bumpingShake: false,
  gameOver: false,
  gameOverImage: null,
  bumpedImages: [],
  timeFinished: null,
  changeInDirectionCounter: 0,
  patience: initialPatience,
  dataToBeRecorded: {
    "Name": null,
    "Distance": null,
    "Average Speed": null,
    "Time Lasted": null,
    "Longest Streak": null,
    "Shortest Streak": null,
    "Direction Changes": null,
    "Dir Changes per Sec": null
  },
  currentScreen: "start",
  doneRecording: false,
  gameStarted: false,
  playerYelled: false,
  time: 0,
  recordForBonus: [{movement: 0, time: 0}],
  weather: "SUNNY",
  backgroundMusic: null,
  snowMusic: null,
  snowAbilityList: [{movement: 0, used: true}],
  timeOfYell: -2*loudnessRechargeInSeconds,
  timeOfRun: -2*maximumSecondsOfRecharge,
  isPaused: false
}

const gameController = (state = initialState, action) => {
  switch(action.type) {
    case "SET_CANVAS":
      return {
        ...state,
        canvas: action.payload
      }
    case "MOVE_PLAYER":
      const allowedMovement = state.movement !== 0 && state.movement + (action.payload.y * state.speed) < 0 ? 0 : state.movement + (action.payload.y * state.speed)
      return {
        ...state,
        player: {
          ...state.player,
          xPosition: state.disabled ? state.player.xPosition : state.player.xPosition + (action.payload.x)
        },
        pathUpdater: state.pathUpdater + 1,
        movement: state.disabled ? state.movement : allowedMovement,
        stage: Math.trunc(allowedMovement/movementsPerStage)
      }
    case "INITIALIZE_BRICK_LIST":
      return {
        ...state,
        centersOfBricks: action.payload
      }
    case "CHANGE_SPEED":
      return {
        ...state,
        speed: action.payload
      }
    case "ADD_TOURIST_TO_GARBAGE":
      return {
        ...state,
        garbageOfTourists: [...state.garbageOfTourists, action.payload]
      }
    case "ADD_TOURIST_TO_ROASTER":
      return {
        ...state,
        touristRoaster: [...state.touristRoaster, action.payload]
      }
    case "EMPTY_GARBAGE_OF_TOURISTS":
      return {
        ...state,
        garbageOfTourists: []
      }
    case "EMPTY_TOURIST_ROASTER":
      return {
        ...state,
        touristRoaster: []
      }
    case "REMOVE_TOURIST_FROM_ROASTER":
      return {
        ...state,
        touristRoaster: state.touristRoaster.filter(tourist => action.payload !== tourist.props.id)
      }
    case "RESET_PLAYER":
      return {
        ...state,
        disabled: true
      }
    case "EXIT_START_SCREEN":
      return {
        ...state,
        startScreenPresent: false
      }
    case "RECORD_STREAK":
      return {
        ...state,
        streak: [...state.streak, action.payload]
      }
    case "FORCE_PATH_PLAYER_MAP_UPDATE":
      return {
        ...state,
        pathUpdater: state.pathUpdater + 1,
        playerUpdater: state.playerUpdater + 1,
        mapUpdater: state.mapUpdater + 1
      }
    case "FORCE_PATH_UPDATE":
      return {
        ...state,
        pathUpdater: state.pathUpdater + 1
      }
    case "CHANGE_MOVEMENT_ABILITY":
      return {
        ...state,
        disabled: action.payload
      }
    case "TOGGLE_BUMPING_SHAKE":
      return {
        ...state,
        bumpingShake: !state.bumpingShake
      }
    case "SET_GAME_OVER":
      return {
        ...state,
        gameOver: true
      }
    case "SET_GAME_OVER_IMAGE":
      return {
        ...state,
        gameOverImage: action.payload
      }
    case "ADD_TO_BUMPED_IMAGES":
      return {
        ...state,
        bumpedImages: [...state.bumpedImages, action.payload]
      }
    case "RECORD_TIME_FINISHED":
      return {
        ...state,
        timeFinished: action.payload
      }
    case "ADD_TO_CHANGE_IN_DIRECTION":
      return {
        ...state,
        changeInDirectionCounter: state.changeInDirectionCounter + 1
      }
    case "SET_NAME":
      return {
        ...state,
        dataToBeRecorded: {
          ...state.dataToBeRecorded,
          "Name": action.payload
        }
      }
    case "RECORD_GAME_STATISTICS":
      return {
        ...state,
        dataToBeRecorded: {
          ...state.dataToBeRecorded,
          ...action.payload
        }
      }
    case "CHANGE_CURRENT_SCREEN":
      return {
        ...state,
        currentScreen: action.payload
      }
    case "MODIFY_PATIENCE":
      return {
        ...state,
        patience: state.patience + action.payload > 0 ? ( state.patience + action.payload > initialPatience ? initialPatience : ( state.isPaused ? state.patience : (state.patience + action.payload))) : 0
      }
    case "SIGNAL_DONE_RECORDING":
      return {
        ...state,
        doneRecording: true
      }
    case "RECORD_TIME_OF_YELL":
      return {
        ...state,
        timeOfYell: action.payload
      }
    case "RECORD_TIME_OF_RUN":
      return {
        ...state,
        timeOfRun: action.payload
      }
    case "SIGNAL_START_GAME":
      return {
        ...state,
        gameStarted: true
      }
    case "RECORD_FOR_BONUS":
      return {
        ...state,
        recordForBonus: [...state.recordForBonus, action.payload]
      }
    case "INCREMENT_TIME":
      return {
        ...state,
        time: action.payload
      }
    case "SET_BACKGROUND_MUSIC_REF":
      return {
        ...state,
        backgroundMusic: action.payload
      }
    case "SET_SNOW_MUSIC_REF":
      return {
        ...state,
        snowMusic: action.payload
      }
    case "CHANGE_WEATHER":
      return {
        ...state,
        weather: action.payload
      }
    case "ADD_TO_SNOW_ABILITY_LIST":
      return {
        ...state,
        snowAbilityList: [...state.snowAbilityList, action.payload]
      }
    case "USE_SNOW_ABILITY":
      const usedList = state.snowAbilityList.filter(record => record.used === true)
      const unusedList = state.snowAbilityList.filter(record => record.used === false)
      return {
        ...state,
        snowAbilityList: [
          ...usedList,
          {movement: unusedList[0].movement, used: true},
          ...unusedList.slice(1)
        ]
      }
    case "CHANGE_PAUSE_STATUS":
      return {
        ...state,
        isPaused: !state.isPaused
      }
    case "RESET_ALL_STATE":
      return {
        ...initialState
      }
    default:
      return state
  }
}

export default gameController
