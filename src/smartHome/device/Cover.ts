import { Stream, Generator } from "/lib/stream";
import { ControllableDevice } from "./Device";

export interface ICoverAttributes {
    position: number;
}

export interface CoverState {
    state?: "open" | "close";
    position?: number;
}

export abstract class Cover<Attributes> extends ControllableDevice<"open" | "closed" | "opening" | "closing" | "stopped", ICoverAttributes & Attributes, CoverState> {
    public get position() { return this.attribute("position").value; }

    constructor(
        entityId: string, 
        keys: {[key in keyof ICoverAttributes]: string}, 
        attributes: { [key in keyof Attributes]: Generator<string, Attributes[key]> }
    ) {
        let lightAttributes: {[key in keyof ICoverAttributes]: Generator<string, ICoverAttributes[key]>} = {
            position: Generator.stream<string>().map(position => Math.round(parseFloat(position))),
        }
        super(entityId, {...attributes, ...lightAttributes} as any); // TODO check!!
        this._keyMap = keys;
    }

    public preventClosingWhileTrue(prevent: Stream<boolean>): Generator<CoverState, CoverState> {
        let stateToForward: CoverState = undefined;
        prevent.changed()
            .filter(state => !state && stateToForward !== undefined)
            .onNext(state => {
                this.apply(stateToForward);
                stateToForward = undefined;
            });

        return Generator.stream<CoverState>()
            .changed()
            .map(state => {
                if (state.state === "close" && prevent.value) {
                    stateToForward = state;
                    return Stream.empty();
                }
                
                stateToForward = undefined;
                return state;
            });
    }
}