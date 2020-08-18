export enum TouristStage {
    NORMAL = 'NORMAL',
    COLLIDED = 'COLLIDED',
    RUNNING = 'RUNNING',
    GONE = 'GONE'
}

export class TouristStageImpl {
    private static order: TouristStage[] = [
        TouristStage.NORMAL,
        TouristStage.COLLIDED,
        TouristStage.RUNNING,
        TouristStage.GONE
    ];

    private touristStages: TouristStage[];

    public constructor(startAt: TouristStage = TouristStage.NORMAL) {
        this.touristStages = TouristStageImpl.order.slice(TouristStageImpl.order.indexOf(startAt));
    }

    public getCurrent = (): TouristStage | void => {
        return this.touristStages[0];
    }

    public next = (): TouristStageImpl => {
        return new TouristStageImpl(this.touristStages[1]);
    }

    public onDisappear = (): TouristStageImpl => {
        return new TouristStageImpl(TouristStage.GONE);
    }
}