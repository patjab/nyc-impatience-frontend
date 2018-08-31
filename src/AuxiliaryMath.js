import { horizonLine, initialPeopleSizes, playerStartY, canvasHeight, canvasWidth } from './setupData'

export const modularWithNegative = (num, modBy) => ((num % modBy) + modBy) % modBy

export const howBigShouldIBe = (currentRow) => (currentRow - horizonLine) * ((initialPeopleSizes)/(playerStartY - horizonLine))



const findAngle = () => {
  const lengthOfGroundTriangle = canvasHeight - horizonLine
  const widthOfGroundTriangle = canvasWidth/2

  const sideOfPath = Math.sqrt(Math.pow(lengthOfGroundTriangle, 2) + Math.pow(widthOfGroundTriangle, 2))
  const numerator = (2 * Math.pow(sideOfPath, 2)) - Math.pow(canvasWidth, 2)
  const denominator = (2 * Math.pow(sideOfPath, 2))

  return Math.acos(numerator/denominator)
}

export const pixelLengthOfBrickPath = (row) => 2 * (row - horizonLine) * Math.tan(findAngle()/2)
