import { canvasHeight, sideAreaColor } from "../setupData";
import { Weather } from "../components/GameBackground";

export interface Position {
    x: number;
    y: number;
}

export type Row = Position[];

export class BrickUtils {

    public static getBrickMatrix(   horizonLine: number, 
                                    canvasWidth: number,

                                    numOfBricksInARow: number,
                                    brickSpacingBetweenRows: number,
                                    movement: number,
                                    movementPerBrick: number,
                                    depthMultiplier: number): Row[] {

        const rowsWithBrickBorders: number[] = this.getRows(horizonLine, brickSpacingBetweenRows, movement, movementPerBrick, depthMultiplier);
        return this.calculateBrickMatrix(rowsWithBrickBorders, horizonLine, canvasWidth, numOfBricksInARow);
    }

    private static calculateBrickMatrix(rowsWithBrickBorders: number[],
                                        horizonLine: number,
                                        canvasWidth: number,
                                        numOfBricksInARow: number): Row[] {
        return rowsWithBrickBorders.reduce((acc: { previousPoints: Row, brickMatrix: Row[] }, row: number) => {
            const distanceFromHorizon: number = row - horizonLine;
            const horizontalPathLength: number = 2 * distanceFromHorizon * Math.tan(this.findAngle(canvasHeight, horizonLine, canvasWidth)/2);
            const xStartOfHorizontalLines: number = (canvasWidth - horizontalPathLength) / 2;
            const currentPoints: Row = this.recordCurrentPoints(horizontalPathLength, xStartOfHorizontalLines, row, numOfBricksInARow);

            const bricksListInRow: Row[] = this.calculateBrickVerticals(acc.previousPoints, currentPoints);
            
            return { brickMatrix: [...acc.brickMatrix, ...bricksListInRow], previousPoints: currentPoints };

        }, { previousPoints: [], brickMatrix: [] }).brickMatrix;
    }

    private static findAngle(canvasHeight: number, horizonLine: number, canvasWidth: number): number {
        const lengthOfGroundTriangle = canvasHeight - horizonLine;
        const widthOfGroundTriangle = canvasWidth/2;

        const sideOfPath = Math.sqrt(Math.pow(lengthOfGroundTriangle, 2) + Math.pow(widthOfGroundTriangle, 2));
        const numerator = (2 * Math.pow(sideOfPath, 2)) - Math.pow(canvasWidth, 2);
        const denominator = (2 * Math.pow(sideOfPath, 2));

        return Math.acos(numerator/denominator);
    }

    private static getRows( horizonLine: number,
                            brickSpacingBetweenRows: number,
                            movement: number,
                            movementPerBrick: number,
                            depthMultiplier: number ): number[] {
        const rowsWithBrickBorders = [];
        for (   let row = horizonLine; row <= canvasHeight; 
                row += (brickSpacingBetweenRows = brickSpacingBetweenRows + (depthMultiplier*(row - horizonLine)))  ) {
                    
            const percentageOfBrick = (movement * movementPerBrick) % 2;
            const absoluteChunkOfBrick = brickSpacingBetweenRows * percentageOfBrick;
            const rowWithBorderBrick = row + (absoluteChunkOfBrick);
            rowsWithBrickBorders.push(rowWithBorderBrick);
                    
        }
        return rowsWithBrickBorders;
      }

    private static recordCurrentPoints(horizontalPathLength: number, xStartOfHorizontalLines: number, row: number, numOfBricksInARow: number) {
        return Array(numOfBricksInARow+1).fill(0).map((num: number, brick: number) => {
            return {x: xStartOfHorizontalLines+(brick*(horizontalPathLength/numOfBricksInARow)), y: row};
        });
    }

    private static calculateBrickVerticals(previousPoints: Row, currentPoints: Row): Row[] {
        return previousPoints.reduce((acc: Row[], previousPoint: Position, i: number) => {
            if ( i < previousPoints.length - 1 ) {
                const brickCenterX: number = ((previousPoints[i+1].x - previousPoint.x) / 2) + previousPoints[i].x;
                const brickCenterY: number = ((currentPoints[i+1].y - previousPoints[i+1].y) / 2) + previousPoints[i+1].y;
                const previousY: number | undefined = i === 0 ? undefined : ((currentPoints[i+0].y - previousPoints[i+0].y) / 2) + previousPoints[i+0].y;

                if ( previousY === brickCenterY ) {
                    return [
                        ...acc.slice(0, -1), 
                        [
                            ...acc.slice(-1)[0], 
                            { x: brickCenterX, y: brickCenterY }
                        ]
                    ];
                } else {
                    return [
                        ...acc,
                        [
                            { x: brickCenterX, y: brickCenterY }
                        ]
                    ];
                }
            } else {
                return acc;
            }
        }, []);
    }

    public static determineSideWeatherColors = (weather: Weather) => {
        if ( weather === Weather.SUNNY ) {
            return sideAreaColor;
        } else if ( weather === Weather.SNOWING ) {
            return '#FFFFFF';
        } else {
            return '';
        }
    }
}