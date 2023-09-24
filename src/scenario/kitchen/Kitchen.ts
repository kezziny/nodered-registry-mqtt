import { Stream } from '/lib/stream';
import { BinarySensor, Cover, Light, Sensor } from 'testHelper';
import cruisingLightAutomation from '../automations/light/CruisingLight';
import spotLightAutomation from '../automations/light/SpotLight';
import activityLightAutomation from '../automations/light/ActivityLight';
import { Priority } from '/lib/smartHome';

let occupancy = {
    room: new BinarySensor("binary_sensor.room_occupancy"),
    corridor: new BinarySensor("binary_sensor.corridor_occupancy"),
    cabinet: new BinarySensor("binary_sensor.cabinet_occupancy")
};
let light = {
    ceiling: new Light("light.kitchen_ceiling"),
    cabinet: new Light("light.kitchen_cabinet")
};
let environment = {
    illuminance: new Sensor("sensor.kitchen_illuminance"),
};
let window = {
    cover: new Cover("cover.kitchen_window"),
    contact: new BinarySensor("binary_sensor.kitchen_window_contact"),
}

// prevent closing the cover while the window is opened and blocking the cover
window.cover.pipeline = window.cover.preventClosingWhileTrue(window.contact.map(state => !state));

// default states that are overridden by automations when necessary
light.ceiling.controller(Priority.Lowest).publish({state: false});
light.cabinet.controller(Priority.Lowest).publish({state: false});

// automations
cruisingLightAutomation.automate(
    { 
        trigger: Stream.ofArray(occupancy.room, occupancy.corridor, occupancy.cabinet).map(readings => readings.some(x => x)),
        illuminance: environment.illuminance,
    },
    { light: light.ceiling.controller(Priority.Low) }
);

activityLightAutomation.automate(
    { 
        trigger: Stream.ofArray(occupancy.room, occupancy.cabinet).map(readings => readings.some(x => x)),
        illuminance: environment.illuminance
    }, 
    { light: light.ceiling.controller(Priority.High) }
);

spotLightAutomation.automate(
    { trigger: occupancy.cabinet },
    { light: light.cabinet.controller() }
);

/*
- notify dishwasher done until its opened
*/

/* bedroom
    - cover open -> anyone ends sleepmode
    - cover close -> light is on and after 6pm
*/