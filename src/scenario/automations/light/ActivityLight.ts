import { Generator, Stream } from "/lib/stream";
import { LightState } from "/lib/smartHome";

interface Trigger {
    trigger: boolean;
    isNight: boolean,
    illuminance: number;
    minimumIlluminance: number;
}

//            - in-kitchen occupancy -> turn on light if lux < X(moderate) and not in sleep mode
export default class {
    public static automate(
        sources: { trigger: Stream<boolean>, illuminance?: Stream<number> },
        devices: { light: Stream<LightState> }
    ) {
        Stream.combine(sources)
            .case(state => !state.trigger, s => s.onNext(_ => devices.light.publish({state: false})))
            .case(state => state.isNight, s => s.onNext(_ => devices.light.publish({state: true, brightness: 25})))
            .filter(state => state.illuminance < state.minimumIlluminance)
            .onNext(_ => devices.light.publish({state: true}))
    }
}