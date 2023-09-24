import { Stream } from '/lib/stream';
import { Settings } from './Settings';
import { Kitchen } from './kitchen/Kitchen';

export class Home {
    settings = new Settings();
    dayMode: Stream<"day"|"dark"|"night"> = new Stream<"day"|"dark"|"night">(); // what for? separate booleans?
    sleepMode: Stream<"awake"|"sleep"|"windingDown"> = new Stream<"awake"|"sleep"|"windingDown">();

    luxOutside: Stream<number> = new Stream<number>();

    rooms = {
        kitchen: new Kitchen()
    }

    constructor() {
        
    }
}