import {howBigShouldIBe} from '../AuxiliaryMath'
import {Position} from '../utils/BrickUtils'
import {initialPlayerSize, movementPerBrick, yNearnessSpook} from '../setupData';

export class TouristUtils {
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