import { Cover as BaseCover, CoverState, DeviceUpdateEventArgs } from "../../smartHome";

export class Cover extends BaseCover<{}> {

    public constructor(entityId: string) {
        super(entityId, {position: "position"}, {});
    }
    
    protected updateDeviceState(event: DeviceUpdateEventArgs) {
        this.publish(event.state as any);
    }

    public apply(state: CoverState): boolean {
        if (state.position !== undefined) {
            this.onDeviceUpdated({
                state: state.position === 100 ? "open" : "closed",
                attributes: {
                    position: state.position + "",
                }
            });
        } else {
            this.onDeviceUpdated({
                state: state.state ? "on" : "off",
                attributes: {
                    position: state.position + "",
                }
            });
        }
        return true;
    }
}