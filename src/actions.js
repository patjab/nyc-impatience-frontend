export const setThisCanvas = (canvas) => {
  return {
    type: "SET_CANVAS",
    payload: canvas
  }
}

export const movePlayer = (x, y) => {
  return {
    type: "MOVE_PLAYER",
    payload: {x, y}
  }
}

export const changeSpeed = (speed) => {
  return {
    type: "CHANGE_SPEED",
    payload: speed
  }
}

export const addTouristGoneCounter = () => {
  return {
    type: "ADD_TOURIST_GONE_COUNTER"
  }
}

// export const addTouristToGarbage = (id) => {
//   return {
//     type: "ADD_TOURIST_TO_GARBAGE",
//     payload: id
//   }
// }

// export const emptyGarbageOfTourists = (id) => {
//   return {
//     type: "EMPTY_GARBAGE_OF_TOURISTS"
//   }
// }

export const addTouristToRoaster = (tourist) => {
  return {
    type: "ADD_TOURIST_TO_ROASTER",
    payload: tourist
  }
}

export const removeTouristFromRoaster = (id) => {
  return {
    type: "REMOVE_TOURIST_FROM_ROASTER",
    payload: id
  }
}

export const emptyTouristRoaster = () => {
  return {
    type: "EMPTY_TOURIST_ROASTER"
  }
}

export const playerBroughtBack = () => {
  return {
    type: "PLAYER_BROUGHT_BACK"
  }
}

export const resetPlayer = () => {
  return {
    type: "RESET_PLAYER"
  }
}

export const recordStreak = (streak) => {
  return {
    type: "RECORD_STREAK",
    payload: streak
  }
}

export const forcePathPlayerMapUpdate = () => {
  return {
    type: "FORCE_PATH_PLAYER_MAP_UPDATE"
  }
}

export const forcePathUpdate = () => {
  return {
    type: "FORCE_PATH_UPDATE"
  }
}

export const forcePauseUpdate = () => {
  return {
    type: "FORCE_PAUSE_UPDATE"
  }
}

export const changeMovementAbility = (isDisabled) => {
  return {
    type: "CHANGE_MOVEMENT_ABILITY",
    payload: isDisabled
  }
}

export const toggleBumpingShake = () => {
  return {
    type: "TOGGLE_BUMPING_SHAKE"
  }
}

export const setGameOver = () => {
  return {
    type: "SET_GAME_OVER"
  }
}

export const setGameOverImage = (imageData) => {
  return {
    type: "SET_GAME_OVER_IMAGE",
    payload: imageData
  }
}

export const addToBumpedImages = (image) => {
  return {
    type: "ADD_TO_BUMPED_IMAGES",
    payload: image
  }
}

export const recordTimeFinished = (time) => {
  return {
    type: "RECORD_TIME_FINISHED",
    payload: time
  }
}

export const addToChangeInDirection = () => {
  return {
    type: "ADD_TO_CHANGE_IN_DIRECTION",
  }
}

export const setName = (name) => {
  return {
    type: "SET_NAME",
    payload: name
  }
}

export const recordGameStatistics = (statistics) => {
  return {
    type: "RECORD_GAME_STATISTICS",
    payload: statistics
  }
}

export const changeCurrentScreen = (screen) => {
  return {
    type: "CHANGE_CURRENT_SCREEN",
    payload: screen
  }
}

export const resetAllState = () => {
  return {
    type: "RESET_ALL_STATE"
  }
}

export const modifyPatience = (modifier) => {
  return {
    type: "MODIFY_PATIENCE",
    payload: modifier
  }
}

export const signalDoneRecording = () => {
  return {
    type: "SIGNAL_DONE_RECORDING"
  }
}

export const signalStartGame = () => {
  return {
    type: "SIGNAL_START_GAME"
  }
}

export const incrementTime = (time) => {
  return {
    type: "INCREMENT_TIME",
    payload: time
  }
}

export const recordForBonus = (record) => {
  return {
    type: "RECORD_FOR_BONUS",
    payload: record
  }
}

export const setBackgroundMusicRef = (musicRef) => {
  return {
    type: "SET_BACKGROUND_MUSIC_REF",
    payload: musicRef
  }
}

export const setRunningMusicRef = (musicRef) => {
  return {
    type: "SET_RUNNING_MUSIC_REF",
    payload: musicRef
  }
}

export const setSnowMusicRef = (musicRef) => {
  return {
    type: "SET_SNOW_MUSIC_REF",
    payload: musicRef
  }
}

export const addToSnowAbilityList = (record) => {
  return {
    type: "ADD_TO_SNOW_ABILITY_LIST",
    payload: record
  }
}

export const useSnowAbility = () => {
  return {
    type: "USE_SNOW_ABILITY"
  }
}

export const changeWeather = (weather) => {
  return {
    type: "CHANGE_WEATHER",
    payload: weather
  }
}

export const recordTimeOfYell = (time) => {
  return {
    type: "RECORD_TIME_OF_YELL",
    payload: time
  }
}

export const recordTimeOfRun = (time) => {
  return {
    type: "RECORD_TIME_OF_RUN",
    payload: time
  }
}

export const changePauseStatus = () => {
  return {
    type: "CHANGE_PAUSE_STATUS"
  }
}
