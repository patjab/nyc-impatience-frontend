import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { recordGameStatistics, changeCurrentScreen, signalDoneRecording } from '../actions'
import { canvasWidth, canvasHeight, marginAroundStats, paddingAroundStats, angryGoomba } from '../setupData'
import { recordHighScore } from '../adapter/adapter'
import NameInput from './NameInput'

class GameStatistics extends Component {
  state = {
    hasPlayedYell: false,
    nameInputReady: false,
    doneGreyscale: false
  }

  fadeToGrey = () => {
    if ( !this.state.hasPlayedYell ) {
      this.refs.losingScream.play()
      this.setState({hasPlayedYell: true})
    }
    this.refs.gameOverMusic.play()
    this.refs.frozenGameOverScreen.onload = () => {
      this.props.canvas.getContext("2d").drawImage(this.refs.frozenGameOverScreen, 0, 0, canvasWidth, canvasHeight)
      let context = this.props.canvas.getContext("2d")
      let canvas = this.props.canvas
      this.grayScale(context, canvas)
      this.refs.frozenGameOverScreen.onload = () => {
          context.drawImage(this.refs.frozenGameOverScreen, 0, 0)
          this.grayScale(context, canvas)
      }
    }
  }

  grayScale(context, canvas) {
    const imgData = context.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imgData.data
    let i = 0
    const pixelInterval = setInterval(() => {
      if ( i >= pixels.length ) {
        clearInterval(pixelInterval)
        this.setState({doneGreyscale: true})
      } else {
        for ( let n = 0; n < (canvasWidth*4)*2; n+= 4 ) {
          const changeRed = 0.30
          const changeGreen = 0.60
          const changeBlue = 0.10
          const grayscale = (pixels[i] * changeRed) + (pixels[i+1] * changeGreen) + (pixels[i+2] * changeBlue)
          pixels[i] = grayscale        // red
          pixels[i+1] = grayscale        // green
          pixels[i+2] = grayscale        // blue
          i+= 4
        }
        context.putImageData(imgData, 0, 0)
      }
    }, 1)
  }

  cfOnlyOnceTemp = true
  displayGameStatsSquare = (ctx) => {
    this.cfOnlyOnceTemp = false
    let i = 0
    let squareWidth, squareHeight
    const maximumWidth = canvasWidth - marginAroundStats
    const maximumHeight = canvasHeight - marginAroundStats
    const startingDimension = 5
    const gameOverSquareAnimation = setInterval(() => {
      if ( squareHeight > maximumHeight ) {
        clearInterval(gameOverSquareAnimation)
        this.setState({nameInputReady: true}, ()=> {
          this.displayStats(ctx)
        })
      } else {
        squareWidth = squareWidth < maximumWidth ? startingDimension + i : maximumWidth
        squareHeight = startingDimension + i

        const xPosition = (canvasWidth/2) - (squareWidth/2)
        const yPosition = (canvasHeight/2) - (squareHeight/2)

        ctx.beginPath()
        ctx.rect(xPosition, yPosition, squareWidth, squareHeight)
        ctx.fillStyle = "#000000"
        ctx.fill()
        ctx.closePath()
        i += 5
      }
    }, 1)
  }

  displayStats = (ctx) => {
    let yCursor = 130
    ctx.textAlign = 'center'
    ctx.font = "50px Geneva"
    ctx.fillStyle = "white"
    ctx.fillText(`GAME OVER`, canvasWidth/2, yCursor)

    let numberOfBumpedImages = this.props.bumpedImages.length

    let sectionPadding = 20
    const availableSpaceOuterLength = canvasWidth - (marginAroundStats*2)
    const availableSpaceInnerLength = availableSpaceOuterLength - (paddingAroundStats*2)

    const marginAroundPictures = 10
    const numberOfMargins = numberOfBumpedImages+1
    const spaceAvailableToAllImages = availableSpaceInnerLength - (numberOfMargins*marginAroundPictures)
    const imageWidth = numberOfBumpedImages <= 2 ? spaceAvailableToAllImages/3 : spaceAvailableToAllImages/(numberOfBumpedImages)
    const proportionalSizeImage = imageWidth/canvasWidth
    const imageHeight = proportionalSizeImage * canvasHeight

    let imageCursorX
    if ( numberOfBumpedImages <= 1 ) {
      imageCursorX = (canvasWidth/2) - (imageWidth/2)
    } else if ( numberOfBumpedImages === 2 ) {
      imageCursorX = (canvasWidth/2) - (imageWidth)
    } else if ( numberOfBumpedImages === 3 ) {
      imageCursorX = marginAroundStats + paddingAroundStats
    }
    let imageCursorY = yCursor + sectionPadding // separate due to ASYNC behavior
    yCursor += sectionPadding

    for (let img64 of this.props.bumpedImages) {
      const image = new Image()
      image.src = img64
      image.onload = () => {
        ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight, imageCursorX, imageCursorY, imageWidth, imageHeight)
        imageCursorX += imageWidth + marginAroundPictures
      }
    }

    if ( numberOfBumpedImages === 0 ) {
      const image = new Image()
      image.src = angryGoomba
      image.onload = () => {
        ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight, imageCursorX, imageCursorY, imageWidth, imageHeight)
      }
    }

    const message = numberOfBumpedImages === 1 ? "You bumped into this tourist" : numberOfBumpedImages === 0 ? "You were just too impatient" : "You bumped into these tourists"

    yCursor += imageHeight + sectionPadding
    ctx.font = "20px Geneva"
    ctx.fillStyle = "white"
    ctx.fillText(message, canvasWidth/2, yCursor)
    yCursor += sectionPadding
    sectionPadding = 50

    ctx.font = "35px Geneva"
    yCursor += sectionPadding
    const afterColon = 10
    const spacing = 40
    const colorOfData = 'red'

    const indivStreaks = []
    for (let i = 0; i < this.props.streak.length; i++) {
      if ( i === 0 ) {
        indivStreaks.push(this.props.streak[0])
      } else {
        indivStreaks.push(this.props.streak[i] - this.props.streak[i-1])
      }
    }

    const recordData = {
      "Distance": Math.trunc(this.props.movement),
      "Average Speed": this.props.movement / (this.props.timeFinished/100),
      "Time Lasted": this.props.timeFinished,
      "Longest Streak": Math.trunc(Math.max(...indivStreaks)),
      "Shortest Streak": Math.trunc(Math.min(...indivStreaks)),
      "Direction Changes": this.props.changeInDirectionCounter,
      "Dir Changes per Sec": this.props.changeInDirectionCounter / (this.props.timeFinished/100)
    }

    this.props.recordGameStatistics(recordData)

    yCursor += sectionPadding

    for ( let attr in recordData ) {
      ctx.textAlign = 'right'
      ctx.fillStyle = 'white'
      ctx.fillText(attr, canvasWidth/2 + (10*afterColon), yCursor)
      ctx.textAlign = 'left'
      ctx.fillStyle = colorOfData
      ctx.fillText(`${Math.round(recordData[attr] * 100) / 100}`, canvasWidth/2 + (12*afterColon), yCursor)
      yCursor += spacing
    }

    yCursor += (2*sectionPadding)
    ctx.textAlign = 'center'
    ctx.fillStyle = 'white'
    ctx.fillText("Enter your name", canvasWidth/2, yCursor)

    ctx.font = "24px Geneva"
    ctx.fillStyle = "white"
    ctx.textAlign = 'right'
    ctx.fillText("[ESC] for High Scores", canvasWidth-100, canvasHeight-100)

    window.addEventListener('keydown', this.switchToHighScores)
  }

  switchToHighScores = (e) => {
    if (e.keyCode === 27) {
      this.props.changeCurrentScreen("highScores")
    }
  }

  formatAndSaveGameStatistics = () => {
    const unformatted = this.props.dataToBeRecorded
    const formatted = {
      high_score: {
        name: unformatted["Name"],
        distance: unformatted["Distance"],
        average_speed: unformatted["Average Speed"],
        time_lasted: unformatted["Time Lasted"],
        longest_streak: unformatted["Longest Streak"],
        shortest_streak: unformatted["Shortest Streak"],
        direction_changes: unformatted["Direction Changes"],
        direction_changes_per_second: unformatted["Dir Changes per Sec"]
      }
    }
    return recordHighScore(formatted)
  }

  componentDidUpdate() {
    const ctx = this.props.canvas.getContext("2d")
    if ( this.state.doneGreyscale && this.cfOnlyOnceTemp ) {
      this.displayGameStatsSquare(ctx)
    } else if ( this.props.dataToBeRecorded["Name"] ) {
      this.formatAndSaveGameStatistics().then(() => {
        this.props.signalDoneRecording()
      })
    }
  }

  componentDidMount() {
    this.fadeToGrey()
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.switchToHighScores)
  }

  render() {
    return (
      <Fragment>
        <audio src='../losingScream.wav' ref='losingScream'/ >
        <audio src='../gameOver.mp3' loop='true' ref='gameOverMusic'/ >
        <img src={this.props.gameOverImage} alt='frozenGameOverScreen' ref='frozenGameOverScreen' className='hidden'/>
        { this.state.nameInputReady ? <NameInput/> : null }
      </Fragment>
    )
  }

}

const mapStateToProps = (state) => {
  return {
    canvas: state.canvas,
    dataToBeRecorded: state.dataToBeRecorded,
    lives: state.lives,
    bumpedImages: state.bumpedImages,
    streak: state.streak,
    timeFinished: state.timeFinished,
    changeInDirectionCounter: state.changeInDirectionCounter,
    gameOverImage: state.gameOverImage,
    movement: state.movement
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    recordGameStatistics: (recordData) => dispatch(recordGameStatistics(recordData)),
    changeCurrentScreen: (screen) => dispatch(changeCurrentScreen(screen)),
    signalDoneRecording: () => dispatch(signalDoneRecording())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GameStatistics)
