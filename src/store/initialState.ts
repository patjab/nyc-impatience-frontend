import {playerStartX, playerStartY, walking, initialPatience, loudnessRechargeInSeconds, maximumSecondsOfRecharge} from '../setupData';
import {CanvasScreen} from '../utils/CanvasScreens';
import {Weather} from '../utils/Weather';

export interface Statistics {
  "Name": string | null,
  "Distance": number | null,
  "Average Speed": number | null,
  "Time Lasted": number | null,
  "Longest Streak": number | null,
  "Shortest Streak": number | null,
  "Direction Changes": number | null,
  "Dir Changes per Sec": number | null
}

export interface AppState {
    canvas: HTMLCanvasElement | null;
    player: {
      xPosition: number;
      yPosition: number;
    },
    movement: number;
    speed: number;
    touristRoaster: React.Component<any>[];
    streak: number[];
    stage: number;
    disabled: boolean;
    bumpingShake: boolean;
    gameOver: boolean;
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
    recordForBonus: {movement: number, time: number}[];
    weather: Weather;
    backgroundMusic: HTMLAudioElement | null;
    runningMusic: HTMLAudioElement | null; 
    snowMusic: HTMLAudioElement | null;
    snowAbilityList: {movement: 0, used: boolean}[];
    timeOfYell: number;
    timeOfRun: number;
    isPaused: boolean;
    timePaused: Date | null;
    totalPausedTime: number | null;
    touristGoneCounter: number;
};

export const initialState: AppState = {
    canvas: null,
    player: {
      xPosition: playerStartX,
      yPosition: playerStartY
    },
    movement: 0,
    speed: walking,
    touristRoaster: [],
    streak: [],
    stage: 0,
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
    totalPausedTime: null,
    touristGoneCounter: 0
};