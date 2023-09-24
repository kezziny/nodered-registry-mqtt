import { Light } from '../../testHelper/device/Light';

describe('Publisher', () => {
    let light:Light;

    beforeEach(() => {
        light = new Light("id");
        light.onDeviceUpdated({state: "off", attributes:{}})
    });

    it('default', async () => {
        expect(light.value).toBe(false);
    });
});