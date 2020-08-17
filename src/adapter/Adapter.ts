import {Statistics} from '../store/initialState';

const baseURL = `https://impatience-api.herokuapp.com/api/v1/high_scores/`;

interface ScoreResponse {
  average_speed: number;
  created_at: string;
  direction_changes: number;
  direction_changes_per_second: number;
  distance: number;
  id: number;
  longest_streak: number;
  name: string;
  shortest_streak: number;
  time_lasted: number;
  updated_at: string;
}

enum RequestMethod {
  GET = 'GET',
  POST = 'POST'
}

export class Adapter {
  public static getHighScores(): Promise<ScoreResponse[]> {
    return fetch(baseURL, {
      headers: {
        'Content-Type': 'application/json',
        Accepts: 'application/json',
      },
      method: RequestMethod.GET,
    })
    .then((resp: Response) => resp.json());
  }

  public static recordHighScore(gameStatistics: Statistics): Promise<ScoreResponse> {
    return fetch(baseURL, {
      headers: {
        'Content-Type': 'application/json',
        Accepts: 'application/json',
      },
      method: RequestMethod.POST,
      body: JSON.stringify(gameStatistics)
    })
    .then((res: Response) => res.json());
  }
}
