import {ActionKeys} from './ActionKeys';
import {UnnamedStatistics} from './initialState';
import {CanvasScreen} from '../utils/CanvasScreens';
import {Weather} from '../utils/Weather';
import {ActionsUnion, createAction} from '../domain/ActionHelpers';

export const Actions = {
  movePlayer: (x: number, y: number) => createAction(ActionKeys.MOVE_PLAYER, {x, y}),
  changeSpeed: (speed: number) => createAction(ActionKeys.CHANGE_SPEED, speed),
  removeTouristFromRoaster: (id: number) => createAction(ActionKeys.REMOVE_TOURIST_FROM_ROASTER, id),
  resetPlayer: () => createAction(ActionKeys.RESET_PLAYER),
  changeMovementAbility: (isDisabled: boolean) => createAction(ActionKeys.CHANGE_MOVEMENT_ABILITY, isDisabled),
  toggleBumpingShake: () => createAction(ActionKeys.TOGGLE_BUMPING_SHAKE),
  setGameOver: () => createAction(ActionKeys.SET_GAME_OVER),
  setGameOverImage: (imageData: string) => createAction(ActionKeys.SET_GAME_OVER_IMAGE, imageData),
  changeCurrentScreen: (screen: CanvasScreen) => createAction(ActionKeys.CHANGE_CURRENT_SCREEN, screen),
  resetAllState: () => createAction(ActionKeys.RESET_ALL_STATE),
  modifyPatience: (modifier: number) => createAction(ActionKeys.MODIFY_PATIENCE, modifier),
  signalDoneRecording: () => createAction(ActionKeys.SIGNAL_DONE_RECORDING),
  signalStartGame: () => createAction(ActionKeys.SIGNAL_START_GAME),
  incrementTime: (time: number) => createAction(ActionKeys.INCREMENT_TIME, time),
  addToSnowAbilityList: (record: {movement: number, used: boolean}) => createAction(ActionKeys.ADD_TO_SNOW_ABILITY_LIST, record),
  useSnowAbility: () => createAction(ActionKeys.USE_SNOW_ABILITY),
  changeWeather: (weather: Weather) => createAction(ActionKeys.CHANGE_WEATHER, weather),
  recordTimeOfYell: (time: number) => createAction(ActionKeys.RECORD_TIME_OF_YELL, time),
  recordTimeOfRun: (time: number) => createAction(ActionKeys.RECORD_TIME_OF_RUN, time),
  changePauseStatus: () => createAction(ActionKeys.CHANGE_PAUSE_STATUS),

  // Logic progression

  // Screen progression
  
  // Record statistics
  setName: (name: string) => createAction(ActionKeys.SET_NAME, name),
  recordStreak: (streak: number) => createAction(ActionKeys.RECORD_STREAK, streak),
  addToBumpedImages: (image: string) => createAction(ActionKeys.ADD_TO_BUMPED_IMAGES, image),
  recordTimeFinished: (time: number) => createAction(ActionKeys.RECORD_TIME_FINISHED, time),
  addToChangeInDirection: () => createAction(ActionKeys.ADD_TO_CHANGE_IN_DIRECTION),
  recordGameStatistics: (statistics: UnnamedStatistics) => createAction(ActionKeys.RECORD_GAME_STATISTICS, statistics),
  recordForBonus: (record: {movement: number, time: number}) => createAction(ActionKeys.RECORD_FOR_BONUS, record),

  // Mutative Refs
  setBackgroundMusicRef: (musicRef: HTMLAudioElement) => createAction(ActionKeys.SET_BACKGROUND_MUSIC_REF, musicRef),
  setRunningMusicRef: (musicRef: HTMLAudioElement) => createAction(ActionKeys.SET_RUNNING_MUSIC_REF, musicRef),
  setSnowMusicRef: (musicRef: HTMLAudioElement) => createAction(ActionKeys.SET_SNOW_MUSIC_REF, musicRef),
};

export type Actions = ActionsUnion<typeof Actions>;
