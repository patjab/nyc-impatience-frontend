export type ActionsUnion<A extends ActionCreatorsMapObject> = ReturnType<A[keyof A]>;
type ActionCreatorsMapObject = {[actionCreator: string]: (...args: any[]) => any};

interface AppAction<T = any> {
  type: T;
}

interface ActionWithPayload<T extends string, P> extends AppAction<T> {
  payload: P;
}

export function createAction<T extends string>(type: T): AppAction<T>;
export function createAction<T extends string, P>(type: T, payload: P): ActionWithPayload<T, P>;
export function createAction<T extends string, P>(type: T, payload?: P) {
  return payload ? { type, payload } : { type };
}