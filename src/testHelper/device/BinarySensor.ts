import { DeviceUpdateEventArgs } from "../../smartHome/device/Device";
import { BinarySensor as BaseBinarySensor } from "../../smartHome/device/BinarySensor";

export class BinarySensor extends BaseBinarySensor {

    public constructor(entityId: string) {
        super(entityId, {});
    }
    
    protected updateDeviceState(event: DeviceUpdateEventArgs) {
        this.publish(event.state === "on");
    }
}