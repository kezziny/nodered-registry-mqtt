import {MqttService} from './MqttService';
let service;

describe('MqttService', () => {
    beforeEach(() => {
		service = new MqttService();
	});

    describe('init', () => {
		it('missing host - ERROR', async () => {
			try {
				service.init();
			} catch(e) {
				expect(e instanceof Error).toBeTruthy();
				expect(e.message).toBe("node is required");
			}
		});
    });
});
