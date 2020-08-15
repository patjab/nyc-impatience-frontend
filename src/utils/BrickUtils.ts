import { canvasHeight, sideAreaColor } from "../setupData";
import { Weather } from "../components/GameBackground";

interface Position {
    x: number;
    y: number;
}

export type Row = Position[];

export class BrickUtils {


    public static makeBricks(   
                                horizonLine: number, 
                                canvasWidth: number,
                                shouldAlternateOdd: boolean,

                                numOfBricksInARow: number,
                                brickBorderColor: string,
                                ctx: any,
                                brickSpacingBetweenRows: number,
                                movement: number,
                                movementPerBrick: number,
                                depthMultiplier: number): Row[] {

        const rowsWithBrickBorders = this.getRows(
            horizonLine, 
            brickSpacingBetweenRows,
            movement,
            movementPerBrick,
            depthMultiplier
        );

        let previousPoints: any[] = []

        let bricksList: Row[] = [];
    
        for ( let row of rowsWithBrickBorders ) {
          const distanceFromHorizon = row - horizonLine
          this.drawHorizontalRow(ctx, row, canvasWidth)
          const horizontalPathLength = 2 * distanceFromHorizon * Math.tan(this.findAngle(canvasHeight, horizonLine, canvasWidth)/2)
          const xStartOfHorizontalLines = (canvasWidth - horizontalPathLength) / 2
          const currentPoints = this.recordCurrentPoints(horizontalPathLength, xStartOfHorizontalLines, row, numOfBricksInARow)
          const bricksListInRow = this.drawVerticals(ctx, previousPoints, currentPoints, shouldAlternateOdd, brickBorderColor)
    
          bricksList = [...bricksList, ...bricksListInRow]
    
          previousPoints = [...currentPoints]
          shouldAlternateOdd = !shouldAlternateOdd
        }
    
        // FIX IMPURE
        return bricksList;
    }

    private static findAngle(canvasHeight: number,
        horizonLine: number,
        canvasWidth: number ): number {

        const lengthOfGroundTriangle = canvasHeight - horizonLine;
        const widthOfGroundTriangle = canvasWidth/2;

        const sideOfPath = Math.sqrt(Math.pow(lengthOfGroundTriangle, 2) + Math.pow(widthOfGroundTriangle, 2));
        const numerator = (2 * Math.pow(sideOfPath, 2)) - Math.pow(canvasWidth, 2);
        const denominator = (2 * Math.pow(sideOfPath, 2));

        return Math.acos(numerator/denominator);

    }

    private static getRows(
        horizonLine: number,
        brickSpacingBetweenRows: number,
        movement: number,
        movementPerBrick: number,
        depthMultiplier: number,
    ) {
        const rowsWithBrickBorders = []
        for ( let row = horizonLine; row <= canvasHeight; row += brickSpacingBetweenRows ) {
          const distanceFromHorizon = row - horizonLine
          const percentageOfBrick = (movement * movementPerBrick) % 2
          const absoluteChunkOfBrick = brickSpacingBetweenRows * percentageOfBrick
          const rowWithBorderBrick = row + (absoluteChunkOfBrick)
          rowsWithBrickBorders.push(rowWithBorderBrick)

          // FIX IMPURE
          brickSpacingBetweenRows = brickSpacingBetweenRows + (depthMultiplier*distanceFromHorizon)
        }
        rowsWithBrickBorders.push(canvasHeight)
        rowsWithBrickBorders.sort((a,b)=>a-b)
        return rowsWithBrickBorders
      }

    private static recordCurrentPoints(horizontalPathLength: number, xStartOfHorizontalLines: number, row: number, numOfBricksInARow: number) {
        let currentPoints = []
        for ( let brick = 0; brick <= numOfBricksInARow; brick++) {
          const widthOfBrick = horizontalPathLength/numOfBricksInARow
          currentPoints.push({x: xStartOfHorizontalLines+(brick*widthOfBrick), y: row})
        }
        return currentPoints
    }

    private static drawHorizontalRow(ctx: any, row: number, canvasWidth: number) {
        ctx.beginPath()
        ctx.moveTo(0, row)
        ctx.lineTo(canvasWidth, row)
        ctx.stroke()
    };


    // CHEAP FIX need separation of concerns here
    // separation of concerns to pure function
    private static drawVerticals(ctx: any, previousPoints: any, currentPoints: any, shouldAlternateOdd: any, brickBorderColor: string) {
        const bricksList = []

        let previousY

        for ( let i = 0; i < previousPoints.length-1; i++ ) {
            if ( (shouldAlternateOdd && i % 2 === 0) || (!shouldAlternateOdd && i % 2 === 1 )  ) {
                ctx.beginPath()
                ctx.moveTo(previousPoints[i].x, previousPoints[i].y)
                ctx.lineTo(currentPoints[i].x, currentPoints[i].y)
                ctx.strokeStyle = brickBorderColor
                ctx.stroke()
            }

            const brickCenterX = ((previousPoints[i+1].x - previousPoints[i].x) / 2) + previousPoints[i].x;
            const brickCenterY = ((currentPoints[i+1].y - previousPoints[i+1].y) / 2) + previousPoints[i+1].y;

            if ( previousY === brickCenterY ) {
                bricksList[bricksList.length-1].push({x: brickCenterX, y: brickCenterY});
            } else {
                bricksList.push([{x: brickCenterX, y: brickCenterY}]);
            }

            previousY = brickCenterY;

        }
        return bricksList;
    }

    public static determineSideWeatherColors = (weather: Weather) => {
        if ( weather === Weather.SUNNY ) {
          return sideAreaColor;
        } else if ( weather === Weather.SNOWING ) {
          return '#FFFFFF';
        }
    }
}