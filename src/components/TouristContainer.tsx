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
    time: number;
    timeOfYell: number;
    recordTimeOfYell: (time: number) => void;
}

interface TouristContainerState {
    touristRoaster: TouristComponent[];
    touristGoneCounter: number;
}

class TouristContainer extends React.PureComponent<TouristContainerProps, TouristContainerState> {
    private readonly scaredTouristListenerInterval: number;

    public constructor(props: TouristContainerProps) {
        super(props);
        this.scaredTouristListenerInterval = this.scaredTouristListener();
        this.state = {
            touristRoaster: [],
            touristGoneCounter: 0
        }
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
                for ( let tourist of this.state.touristRoaster ) {
                    tourist.spookedRunAway();
                }
            }
        }, 100);
    }
    
    private renderTourists = (numberOfTourists: number, bricksList: Row[]): JSX.Element[] => {        
        let tourists: JSX.Element[] = [];
        console.log(this.state.touristGoneCounter, (numberOfTourists + this.props.stage + this.state.touristGoneCounter))

        for ( let i = this.state.touristGoneCounter; i < (numberOfTourists + this.props.stage + this.state.touristGoneCounter); i++ ) {
            tourists.push(
                <Tourist 
                    key={i} 
                    id={i} 
                    brickPositions={bricksList} 
                    canvasContext={this.props.canvasContext} 
                    canvas={this.props.canvas}
                    addTouristToRoaster={this.addTouristToRoaster}
                    addTouristGoneCounter={this.addTouristGoneCounter}
                />
            );
        }
        return tourists;
    }

    private addTouristToRoaster = (tourist: TouristComponent) => {
        this.setState({ touristRoaster: [...this.state.touristRoaster, tourist] });
    }

    private addTouristGoneCounter = () => {
        this.setState({ touristGoneCounter: this.state.touristGoneCounter + 1 });
    }
}

const mapStateToProps = (state: AppState) => {
    return {
        time: state.time,
        timeOfYell: state.timeOfYell,
        stage: state.stage
    };
}
  
const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        recordTimeOfYell: (time: number) => dispatch(Actions.recordTimeOfYell(time))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TouristContainer);