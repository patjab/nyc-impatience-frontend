import {playerStartX, playerStartY, walking, initialPatience, loudnessRechargeInSeconds, maximumSecondsOfRecharge} from '../setupData';
import {CanvasScreen} from '../utils/CanvasScreens';
import {Weather} from '../utils/Weather';

export interface UnnamedStatistics {
  "Distance": number | null,
  "Average Speed": number | null,
  "Time Lasted": number | null,
  "Longest Streak": number | null,
  "Shortest Streak": number | null,
  "Direction Changes": number | null,
  "Dir Changes per Sec": number | null
}
export interface Statistics extends UnnamedStatistics{
  "Name": string | null
}

export interface PlayerPosition {
  xPosition: number;
  yPosition: number;
}

export interface RecordForBonus {
  movement: number;
  time: number;
}

export interface AppState {
    player: PlayerPosition,
    movement: number;
    speed: number;
    streak: number[];
    stage: number;
    disabled: boolean;
    bumpingShake: boolean;
    gameOverImage: null | string;
    bumpedImages: string[];
    timeFinished: number | null;
    changeInDirectionCounter: number;
    patience: number;
    dataToBeRecorded: Statistics;
    currentScreen: CanvasScreen;
    doneRecording: boolean;
    gameStarted: boolean;
    time: number;
    recordForBonus: RecordForBonus[];
    weather: Weather;
    backgroundMusic: HTMLAudioElement | null;
    runningMusic: HTMLAudioElement | null; 
    snowMusic: HTMLAudioElement | null;
    snowAbilityList: {movement: number, used: boolean}[];
    timeOfYell: number;
    timeOfRun: number;
    isPaused: boolean;
    timePaused: Date | null;
    totalPausedTime: number | null;
};

export const initialState: AppState = {
    player: {
      xPosition: playerStartX,
      yPosition: playerStartY
    },
    movement: 0,
    speed: walking,
    streak: [],
    stage: 0,
    disabled: false,
    bumpingShake: false,
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
    currentScreen: CanvasScreen.START,
    doneRecording: false,
    gameStarted: false,
    time: 0,
    recordForBonus: [{movement: 0, time: 0}],
    weather: Weather.SUNNY,
    backgroundMusic: null,
    runningMusic: null, 
    snowMusic: null,
    snowAbilityList: [{movement: 0, used: true}],
    timeOfYell: -2*loudnessRechargeInSeconds,
    timeOfRun: -2*maximumSecondsOfRecharge,
    isPaused: false,
    timePaused: null,
    totalPausedTime: null
};