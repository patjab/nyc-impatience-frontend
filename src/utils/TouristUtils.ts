import {howBigShouldIBe} from '../AuxiliaryMath'
import {Position, Row} from '../utils/BrickUtils'
import {initialPlayerSize, movementPerBrick, yNearnessSpook, rendingTouristRowsPercentage} from '../setupData';
import {tourist1, tourist2, tourist3} from '../images';

export type PositionOnArray = {row: number, col: number};

export class TouristUtils {

    public static chooseRandomPosition(brickMatrix: Row[]) {
        return {
            chosenRow: Math.trunc(Math.trunc(Math.random()*(brickMatrix.length-1)) * rendingTouristRowsPercentage),
            chosenCol: Math.trunc(Math.random()*(brickMatrix[0].length-1))
        };
    }


    public static convertRowColToXY(brickMatrix: Row[], movement: number, movementPositionOnMounted: number, positionOnArray: PositionOnArray, initialRow: number, allowTouristToRun: boolean) {
        const brickTransitionHelper = TouristUtils.brickTransitionHelper(movement, movementPositionOnMounted);
        const chosenRow = positionOnArray && allowTouristToRun ? positionOnArray.row : (initialRow+ brickTransitionHelper) % brickMatrix.length;
        const chosenCol = positionOnArray ? positionOnArray.col : 0;
    
        return {
            positionX: chosenRow < 0 ? 0 : brickMatrix[chosenRow][chosenCol].x,
            positionY: chosenRow < 0 ? 0 : brickMatrix[chosenRow][chosenCol].y,
            positionOnArray: {col: chosenCol, row: chosenRow}
        };
    }

    private static brickTransitionHelper(movement: number, mountedOnMovement: number) {
        return (Math.trunc(movementPerBrick * (movement) * 0.5) * 2) - (Math.trunc(movementPerBrick * mountedOnMovement * 0.5) * 2);
    }



    public static getTouristImages(index: number): string {
        return [tourist1, tourist2, tourist3][index];
    }

    public static hasCollided(positionX: number, positionY: number, playerX: number, playerY: number): boolean {
        const sizeOfSide: number = howBigShouldIBe(positionY);
        return this.bumpOnTheSide(positionX, positionY, playerX, playerY, sizeOfSide) && this.withinYRange(positionY, playerY, sizeOfSide);
    }
    
    private static bumpOnTheSide = (positionX: number, positionY: number, playerX: number, playerY: number, sizeOfSide: number): boolean => {    
        const lowerLeftTourist: Position = {x: positionX, y: positionY + sizeOfSide};
        const lowerRightTourist: Position = {x: positionX + sizeOfSide, y: positionY + sizeOfSide};
        const lowerLeftPlayer: Position = {x: playerX, y: playerY + initialPlayerSize};
        const lowerRightPlayer: Position = {x: playerX + initialPlayerSize, y: playerY + initialPlayerSize};
    
        const bumpOnTheLeft: boolean = (lowerLeftPlayer.x >= lowerLeftTourist.x && lowerLeftPlayer.x <= lowerRightTourist.x);
        const bumpOnTheRight: boolean = (lowerRightPlayer.x >= lowerLeftTourist.x && lowerRightPlayer.x <= lowerRightTourist.x);
    
        return bumpOnTheLeft || bumpOnTheRight;
    }
    
    private static withinYRange = (positionY: number, playerY: number, sizeOfSide: number): boolean => {    
        const lowerPlayer: number = playerY + initialPlayerSize;
        const lowerTourist: number = positionY + sizeOfSide;

        const pixelsPerBrickAtLowerPlayer: number = 20;
        const upperTourist: number = lowerTourist - (pixelsPerBrickAtLowerPlayer * movementPerBrick * yNearnessSpook);
    
        return ( lowerPlayer <= lowerTourist && lowerPlayer >= upperTourist );
    }
}