import { Switch as BaseSwitch, DeviceUpdateEventArgs, SwitchState } from "/lib/smartHome";

export class Switch extends BaseSwitch<{}> {

    public constructor(entityId: string) {
        super(entityId, {energy: "energy", power: "power"}, {});
    }
    
    protected updateDeviceState(event: DeviceUpdateEventArgs) {
        this.publish(event.state === "on");
    }

    public apply(state: SwitchState): boolean {
        this.onDeviceUpdated({
            state: state.state ? "on" : "off",
            attributes: {}
        });

        return true;
    }
}