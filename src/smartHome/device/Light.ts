import { Generator } from "/lib/stream";
import { ControllableDevice } from "./Device";

export interface ILightAttributes {
    brightness: number;
    kelvin: number;
}

export interface LightState {
    state?: boolean;
    brightness?: number;
    kelvin?: number;
}

export abstract class Light<Attributes> extends ControllableDevice<boolean, ILightAttributes & Attributes, LightState> {
    public get brightness() { return this.attribute("brightness").value; }
    public get kelvin() { return this.attribute("kelvin").value; }

    constructor(
        entityId: string, 
        keys: {[key in keyof ILightAttributes]: string}, 
        attributes: { [key in keyof Attributes]: Generator<string, Attributes[key]> }
    ) {
        let lightAttributes: {[key in keyof ILightAttributes]: Generator<string, ILightAttributes[key]>} = {
            kelvin: Generator.stream<string>().map(power => Math.round(parseFloat(power))),
            brightness: Generator.stream<string>().map(energy => Math.round(parseFloat(energy) * 100 / 255)),
        }
        super(entityId, {...attributes, ...lightAttributes} as any); // TODO check!!
        this._keyMap = keys;
    }
}