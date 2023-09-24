import { DeviceUpdateEventArgs } from "../../smartHome/device/Device";
import { Light as BaseLight, LightState } from "../../smartHome/device/Light";

export class Light extends BaseLight<{}> {

    public constructor(entityId: string) {
        super(entityId, {brightness: "brightness", kelvin: "color_temp"}, {});
    }
    
    protected updateDeviceState(event: DeviceUpdateEventArgs) {
        this.publish(event.state === "on");
    }

    public apply(state: LightState): boolean {
        this.onDeviceUpdated({
            state: state.state ? "on" : "off",
            attributes: {
                brightness: state.brightness ? ""+state.brightness : "255",
                color_temp: state.kelvin ? ""+state.kelvin : "3500"
            }
        });
        return true;
    }
}