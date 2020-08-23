import * as React from 'react';
import {microphoneRunner, loudEnough} from '../mediaHelper/microphoneHelper';
import {loudnessSpookLevel, loudnessRechargeInSeconds, touristDensity} from '../setupData';
import {ScreenProps} from '../App';
import Tourist, { TouristComponent} from './Tourist';
import {connect} from 'react-redux';
import {AppState} from '../store/initialState';
import {Dispatch} from 'redux';
import {Actions} from '../store/Actions';
import {Row} from '../utils/BrickUtils';

interface TouristContainerProps extends ScreenProps {
    brickMatrix: Row[];
    stage: number;
    touristGoneCounter: number;
    time: number;
    timeOfYell: number;
    touristRoaster: TouristComponent[];
    recordTimeOfYell: (time: number) => void;
}

interface TouristContainerState {}

class TouristContainer extends React.PureComponent<TouristContainerProps, TouristContainerState> {
    private readonly scaredTouristListenerInterval: number;

    public constructor(props: TouristContainerProps) {
        super(props);
        this.scaredTouristListenerInterval = this.scaredTouristListener();
    }

    public componentWillUnmount(): void {
        window.clearInterval(this.scaredTouristListenerInterval);
    }

    public render(): JSX.Element[] {
        return this.renderTourists(touristDensity, this.props.brickMatrix);
    }

    private scaredTouristListener = (): number => {
        microphoneRunner(loudnessSpookLevel);
        return window.setInterval(() => {
            const hasGameStarted = this.props.time > 0;
            const readyForYelling = (this.props.time/1000) - this.props.timeOfYell > loudnessRechargeInSeconds
            if ( hasGameStarted && loudEnough && readyForYelling ) {
                this.props.recordTimeOfYell(this.props.time/1000)
                for ( let tourist of this.props.touristRoaster ) {
                    tourist.spookedRunAway();
                }
            }
        }, 100);
    }
    
    private renderTourists = (numberOfTourists: number, bricksList: Row[]): JSX.Element[] => {        
        let tourists = [];
        for ( let i = this.props.touristGoneCounter; i < (numberOfTourists + this.props.stage + this.props.touristGoneCounter); i++ ) {
            tourists.push(<Tourist key={i} id={i} brickPositions={bricksList} canvasContext={this.props.canvasContext} canvas={this.props.canvas}/>);
        }
        return tourists;
    }
}

const mapStateToProps = (state: AppState) => {
    return {
        time: state.time,
        timeOfYell: state.timeOfYell,
        touristRoaster: state.touristRoaster,
        stage: state.stage,
        touristGoneCounter: state.touristGoneCounter
    };
}
  
const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        recordTimeOfYell: (time: number) => dispatch(Actions.recordTimeOfYell(time))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TouristContainer);