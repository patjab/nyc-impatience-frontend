const baseURL = `https://impatience-api.herokuapp.com/api/v1/high_scores/`

const getHighScores = () => {
  return fetch(baseURL)
  .then(resp => resp.json())
}

const recordHighScore = (gameStatistics) => {
  return fetch(baseURL, {
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      ...gameStatistics
    })
  })
  .then(res => res.json())
}

export {
  getHighScores,
  recordHighScore
}
