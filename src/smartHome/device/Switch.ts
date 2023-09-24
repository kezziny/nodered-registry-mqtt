import { Stream, Generator } from '/lib/stream';
import { ControllableDevice } from "./Device";

export interface SwitchState {
    state: boolean;
}

export interface ISwitchAttributes {
    energy: number;
    power: number;
}

export abstract class Switch<Attributes> extends ControllableDevice<boolean, Attributes & ISwitchAttributes, SwitchState> {
    public get power() { return this.attribute("power").value; }
    public get energy() { return this.attribute("energy").value; }

    constructor(
        entityId: string, 
        keys: {[key in keyof ISwitchAttributes]: string}, 
        attributes: { [key in keyof Attributes]: Generator<string, Attributes[key]> }
    ) {
        let switchAttributes: {[key in keyof ISwitchAttributes]: Generator<string, ISwitchAttributes[key]>} = {
            power: Generator.stream<string>().map(power => Math.round(parseFloat(power))),
            energy: Generator.stream<string>().map(energy => Math.round(parseFloat(energy))),
        }
        super(entityId, {...attributes, ...switchAttributes} as any); // TODO check!!
        this._keyMap = keys;
    }
}