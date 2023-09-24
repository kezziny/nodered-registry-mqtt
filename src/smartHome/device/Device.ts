import { Stream, Generator, IStream, IPublisher } from "/lib/stream";

export interface DeviceUpdateEventArgs {
    state: string;
    attributes: { [key: string]: string };
}

export abstract class Device<T, DeviceAttributes> extends Stream<T> {
    private _id: string;
    protected _keyMap: {[key: string]: string} = {}
    private _attributes: { [key in keyof DeviceAttributes]: Generator<string, DeviceAttributes[key]> };

    public get id() { return this._id; }

    constructor(entityId: string, attributes: { [key in keyof DeviceAttributes]: Generator<string, DeviceAttributes[key]> }) {
        super();
        this._id = entityId;
        this._attributes = attributes;
    }

    public attribute<Key extends keyof DeviceAttributes>(attribute: Key): Stream<DeviceAttributes[Key]> {
        return this._attributes[attribute];
    }

    public onDeviceUpdated(event: DeviceUpdateEventArgs) {
        this.updateDeviceAttributes(event);
        this.updateDeviceState(event);
    }

    protected abstract updateDeviceState(event: DeviceUpdateEventArgs);

    private updateDeviceAttributes(event: DeviceUpdateEventArgs) {
        for (let key in event.attributes) {
            if (this._attributes.hasOwnProperty(key)) {
                this._attributes[key].generate(event.attributes[key]);
            }

            if (this._keyMap.hasOwnProperty(key)) {
                this._attributes[this._keyMap[key]].generate(event.attributes[key]);
            }
        }
    }
}

export enum Priority {
    Lowest = 1000,
    Low = 750,
    Normal = 500,
    High = 250,
    Highest = 0
}

export abstract class ControllableDevice<T, Attributes,  DeviceState> extends Device<T,Attributes>
{
    private _sources:{stream: Stream<DeviceState>, priority: number}[] = [];
    private _generator: Generator<DeviceState, DeviceState>;

    public set pipeline(generator: Generator<DeviceState, DeviceState>) { this._generator = generator; }

    public controller(priority: number = Priority.Normal): Stream<DeviceState> {
        let controller = new Stream<DeviceState>();
        this._sources.push({stream: controller, priority});
        controller.changed().onNext(() => this.onSourceUpdated());
        return controller;
    }

    private onSourceUpdated(): void {
        let sources = this._sources
            .sort((a, b) => a.priority - b.priority)
            .map(s => s.stream.value)
            .filter(s => s !== undefined);
        if (sources.length === 0) return;

        let result: DeviceState = {} as any;
        for (let source in sources) {
            for (let arg in Object.getOwnPropertyNames(source)) {
                if (result[arg] === undefined) result[arg] = source[arg];
            }
        }

        if (this._generator) {
            this._generator.generate(result);
            result = this._generator.value;
            if (result === undefined) return;
        }

        this.apply(result);
    }

    protected abstract apply(state: DeviceState): boolean;
}