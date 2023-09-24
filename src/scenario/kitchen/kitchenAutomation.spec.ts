import { PresenceLightAutomation } from '../automations/CruisingLight';
import { Home } from '../Home';
import { Stream } from '/lib/stream';

jest.useFakeTimers();

/*describe("scenario - kitchen automation", () => {
    let home: Home;
    let kitchen;

    beforeEach(() => {
        home = new Home();
        kitchen = home.rooms.kitchen;

        // Automation
        PresenceLightAutomation.of({
            occupancy: kitchen.occupancy.corridor,
            illuminance: kitchen.illuminance,
            minimumIlluminance: Stream.just(200),
            isNight: Stream.just(false),
        }).automate(kitchen.light.ceiling);
    });

    it("corridor movement", () => {
        expect(home.rooms.kitchen.light.ceiling.value).toBeFalsy();

        home.rooms.kitchen.occupancy.corridor.onDeviceUpdated({state: "on", attributes:{}});
        expect(home.rooms.kitchen.light.ceiling.value).toBeTruthy();

        home.rooms.kitchen.occupancy.corridor.onDeviceUpdated({state: "off", attributes:{}});
        expect(home.rooms.kitchen.light.ceiling.value).toBeTruthy();

        jest.advanceTimersByTime(4500);
        expect(home.rooms.kitchen.light.ceiling.value).toBeTruthy();

        jest.advanceTimersByTime(500);
        expect(home.rooms.kitchen.light.ceiling.value).toBeFalsy();
    });
});*/