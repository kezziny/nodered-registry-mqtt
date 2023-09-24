import { Stream } from '/lib/stream';

class Settings {
    kelvin = new Stream<number>();
    activeLux = new Stream<number>();
    cruisingnLux = new Stream<number>();

    constructor() {
        
    }
}

export default new Settings();