import * as React from 'react';
import {microphoneRunner, loudEnough} from '../mediaHelper/microphoneHelper';
import {loudnessSpookLevel, loudnessRechargeInSeconds, touristDensity} from '../setupData';
import {ScreenProps} from '../App';
import Tourist from './Tourist';
import {connect} from 'react-redux';
import {AppState} from '../store/initialState';
import {Dispatch} from 'redux';
import {Actions} from '../store/Actions';
import {Row} from '../utils/BrickUtils';

type TouristGeneratorFn = (brickPositions: Row[]) => JSX.Element;
type TouristRoasterNext = Map<number, TouristGeneratorFn>;

interface TouristContainerProps extends ScreenProps {
    brickMatrix: Row[];
    stage: number;
    time: number;
    timeOfYell: number;
    recordTimeOfYell: (time: number) => void;
}

interface TouristContainerState {
    touristRoasterNext: TouristRoasterNext;
}

class TouristContainer extends React.PureComponent<TouristContainerProps, TouristContainerState> {
    private readonly scaredTouristListenerInterval: number;

    public constructor(props: TouristContainerProps) {
        super(props);
        this.scaredTouristListenerInterval = this.scaredTouristListener();
        const touristRoasterNext: TouristRoasterNext = Array.from(Array(touristDensity).keys()).reduce(this.addToTouristRoaster, new Map());
        this.state = { 
            touristRoasterNext
        };
    }

    public componentDidUpdate(): void {
        const numOfActiveTourists: number = this.state.touristRoasterNext.size;
        if ( numOfActiveTourists < this.props.stage + touristDensity ) {
            this.addToTouristRoaster(this.state.touristRoasterNext, Number(new Date()));
        }
    }

    public componentWillUnmount(): void {
        window.clearInterval(this.scaredTouristListenerInterval);
    }

    public render(): JSX.Element[] {
        return Array.from(this.state.touristRoasterNext.entries())
            .map(([id, jsxGenerator]: [number, TouristGeneratorFn]) => jsxGenerator(this.props.brickMatrix));
    }

    //  move this out to a centralized place with intervals/listeners
    private scaredTouristListener = (): number => {
        microphoneRunner(loudnessSpookLevel);
        return window.setInterval(() => {
            const hasGameStarted = this.props.time > 0;
            const readyForYelling = (this.props.time/1000) - this.props.timeOfYell > loudnessRechargeInSeconds;
            if ( hasGameStarted && loudEnough && readyForYelling ) {
                this.props.recordTimeOfYell(this.props.time/1000);
            }
        }, 100);
    }

    private addToTouristRoaster = (acc: TouristRoasterNext, id: number): TouristRoasterNext => {
        return acc.set(id, this.generateTourist(id));
    }

    private removeTouristFromRoaster = (id: number): void => {
        const touristRoasterNext = new Map(this.state.touristRoasterNext);
        touristRoasterNext.delete(id);
        this.setState({ touristRoasterNext });
    }

    private generateTourist = (id: number) => {
        return (brickPositions: Row[]): JSX.Element => {
            return (
                <Tourist 
                    key={id} 
                    id={id} 
                    brickPositions={brickPositions} 
                    canvasContext={this.props.canvasContext} 
                    canvas={this.props.canvas}
                    removeTouristFromRoaster={this.removeTouristFromRoaster}
                />
            );
        };
    }

}

const mapStateToProps = (state: AppState) => ({
    time: state.time,
    timeOfYell: state.timeOfYell,
    stage: state.stage
});
  
const mapDispatchToProps = (dispatch: Dispatch) => ({
    recordTimeOfYell: (time: number) => dispatch(Actions.recordTimeOfYell(time))
});

export default connect(mapStateToProps, mapDispatchToProps)(TouristContainer);