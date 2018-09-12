import React, { Component } from 'react'
import { connect } from 'react-redux'
import StartScreen from './StartScreen'
import Canvas from './components/Canvas'
import HighScores from './components/HighScores'
import Instructions from './components/Instructions'

import './App.css'

class App extends Component {
  render() {
    switch(this.props.currentScreen) {
      case "start":
        return <StartScreen />
      case "highScores":
        return <HighScores />
      case "instructions":
        return <Instructions />
      default:
        return <Canvas />
    }
  }
}

const mapStateToProps = (state) => {
  return {
    currentScreen: state.currentScreen
  }
}

export default connect(mapStateToProps)(App)
