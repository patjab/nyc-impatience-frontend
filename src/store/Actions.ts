import {ActionKeys} from './ActionKeys';
import {Statistics} from './initialState';
import {CanvasScreen} from '../utils/CanvasScreens';
import {Weather} from '../utils/Weather';

const createAction = (type: ActionKeys, payload?: any) => {
  return payload ? { type, payload } : { type };
}

export const Actions = {
  setThisCanvas: (canvas: HTMLCanvasElement | null) => createAction(ActionKeys.SET_CANVAS, canvas),
  movePlayer: (x: number, y: number) => createAction(ActionKeys.MOVE_PLAYER, {x, y}),
  changeSpeed: (speed: number) => createAction(ActionKeys.CHANGE_SPEED, speed),
  addTouristGoneCounter: () => createAction(ActionKeys.ADD_TOURIST_GONE_COUNTER),
  addTouristToRoaster: (tourist: React.Component<any>) => createAction(ActionKeys.ADD_TOURIST_TO_ROASTER, tourist),
  removeTouristFromRoaster: (id: number) => createAction(ActionKeys.REMOVE_TOURIST_FROM_ROASTER, id),
  emptyTouristRoaster: () => createAction(ActionKeys.EMPTY_TOURIST_ROASTER),
  playerBroughtBack: () => createAction(ActionKeys.PLAYER_BROUGHT_BACK),
  resetPlayer: () => createAction(ActionKeys.RESET_PLAYER),
  recordStreak: (streak: number) => createAction(ActionKeys.RECORD_STREAK, streak),
  changeMovementAbility: (isDisabled: boolean) => createAction(ActionKeys.CHANGE_MOVEMENT_ABILITY, isDisabled),
  toggleBumpingShake: () => createAction(ActionKeys.TOGGLE_BUMPING_SHAKE),
  setGameOver: () => createAction(ActionKeys.SET_GAME_OVER),
  setGameOverImage: (imageData: string) => createAction(ActionKeys.SET_GAME_OVER_IMAGE, imageData),
  addToBumpedImages: (image: string) => createAction(ActionKeys.ADD_TO_BUMPED_IMAGES, image),
  recordTimeFinished: (time: number) => createAction(ActionKeys.RECORD_TIME_FINISHED, time),
  addToChangeInDirection: () => createAction(ActionKeys.ADD_TO_CHANGE_IN_DIRECTION),
  setName: (name: string) => createAction(ActionKeys.SET_NAME, name),
  recordGameStatistics: (statistics: Statistics) => createAction(ActionKeys.RECORD_GAME_STATISTICS, statistics),
  changeCurrentScreen: (screen: CanvasScreen) => createAction(ActionKeys.CHANGE_CURRENT_SCREEN, screen),
  resetAllState: () => createAction(ActionKeys.RESET_ALL_STATE),
  modifyPatience: (modifier: number) => createAction(ActionKeys.MODIFY_PATIENCE, modifier),
  signalDoneRecording: () => createAction(ActionKeys.SIGNAL_DONE_RECORDING),
  signalStartGame: () => createAction(ActionKeys.SIGNAL_START_GAME),
  incrementTime: (time: number) => createAction(ActionKeys.INCREMENT_TIME, time),
  recordForBonus: (record: number) => createAction(ActionKeys.RECORD_FOR_BONUS, record),
  setBackgroundMusicRef: (musicRef: HTMLAudioElement) => createAction(ActionKeys.SET_BACKGROUND_MUSIC_REF, musicRef),
  setRunningMusicRef: (musicRef: HTMLAudioElement) => createAction(ActionKeys.SET_RUNNING_MUSIC_REF, musicRef),
  setSnowMusicRef: (musicRef: HTMLAudioElement) => createAction(ActionKeys.SET_SNOW_MUSIC_REF, musicRef),
  addToSnowAbilityList: (record: number) => createAction(ActionKeys.ADD_TO_SNOW_ABILITY_LIST, record),
  useSnowAbility: () => createAction(ActionKeys.USE_SNOW_ABILITY),
  changeWeather: (weather: Weather) => createAction(ActionKeys.CHANGE_WEATHER, weather),
  recordTimeOfYell: (time: number) => createAction(ActionKeys.RECORD_TIME_OF_YELL, time),
  recordTimeOfRun: (time: number) => createAction(ActionKeys.RECORD_TIME_OF_RUN, time),
  changePauseStatus: () => createAction(ActionKeys.CHANGE_PAUSE_STATUS)
};