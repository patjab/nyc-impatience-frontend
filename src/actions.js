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

export const initializeBrickList = (brickList) => {
  return {
    type: "INITIALIZE_BRICK_LIST",
    payload: brickList
  }
}

export const addTouristToGarbage = (id) => {
  return {
    type: "ADD_TOURIST_TO_GARBAGE",
    payload: id
  }
}

export const emptyGarbageOfTourists = (id) => {
  return {
    type: "EMPTY_GARBAGE_OF_TOURISTS"
  }
}

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

export const decreaseLife = () => {
  return {
    type: "DECREASE_LIFE"
  }
}

export const exitStartScreen = () => {
  return {
    type: "EXIT_START_SCREEN"
  }
}

export const recordStreak = (streak) => {
  return {
    type: "RECORD_STREAK",
    payload: streak
  }
}

export const forceUpdateOfPathForAnimation = () => {
  return {
    type: "FORCE_UPDATE_OF_PATH_FOR_ANIMATION"
  }
}

export const forceUpdateOfPlayerForAnimation = () => {
  return {
    type: "FORCE_UPDATE_OF_PLAYER_FOR_ANIMATION"
  }
}

export const forceUpdateOfMapForAnimation = () => {
  return {
    type: "FORCE_UPDATE_OF_MAP_FOR_ANIMATION"
  }
}

export const changeMovementAbility = (isDisabled) => {
  return {
    type: "CHANGE_MOVEMENT_ABILITY",
    payload: isDisabled
  }
}

export const setPlayer = (player) => {
  return {
    type: "SET_PLAYER",
    payload: player
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

export const setChangeInDirection = (count) => {
  return {
    type: "SET_CHANGE_IN_DIRECTION_COUNTER",
    payload: count
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

export const signalBonusOut = () => {
  return {
    type: "SIGNAL_BONUS_OUT"
  }
}

export const resetCurrentBonus = (num) => {
  return {
    type: "RESET_CURRENT_BONUS",
    payload: num
  }
}

export const signalDoneRecording = () => {
  return {
    type: "SIGNAL_DONE_RECORDING"
  }
}
