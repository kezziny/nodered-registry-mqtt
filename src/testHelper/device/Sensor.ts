import { DeviceUpdateEventArgs } from "../../smartHome/device/Device";
import { Sensor as BaseSensor } from "../../smartHome/device/Sensor";

export class Sensor extends BaseSensor {

    public constructor(entityId: string) {
        super(entityId, {});
    }
    
    protected updateDeviceState(event: DeviceUpdateEventArgs) {
        this.publish(parseFloat(event.state));
    }
}