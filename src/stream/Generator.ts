import { IGenerator } from "./IGenerator";
import { Stream } from "./Stream";

export class Generator<Source, T> extends Stream<T> implements IGenerator<Source, T> {
    private _source: Stream<Source> = null;

    private constructor(source: Stream<Source> = null) {
        super();
        this._source = source;
    }

    public generate(value: Source | Error) {
        if (this._source) this._source.publish(value);
    }

    public onNext(subscriber: (value: T) => void): Generator<Source, T> {
        this._onNext.push(subscriber);
        return this;
    }

    public onError(subscriber: (error: Error) => void): Generator<Source, T> {
        this._onError.push(subscriber);
        return this;
    }

    public onEmpty(subscriber: () => void): Generator<Source, T> {
        this._onEmpty.push(subscriber);
        return this;
    }

    public changed(): Generator<Source, T> {
        return super.changed() as Generator<Source, T>
    }

    public switchIfEmpty(value: T | (() => T)): Generator<Source, T> {
        return super.switchIfEmpty(value) as Generator<Source, T>
    }

    public map<U>(transformation: ((value: T) => U)): Generator<Source, U> {
        return super.map<U>(transformation) as Generator<Source, U>
    }

    public filter(filter: ((value: T) => Boolean)): Generator<Source, T> {
        return super.filter(filter) as Generator<Source, T>
    }

    public case(filter: ((value: T) => Boolean) | T, handle: (stream: Stream<T>) => void) {
        return super.case(filter, handle) as Generator<Source, T>;
    }

    public noPublishSince(ms: number): Generator<Source, T> {
        return super.noPublishSince(ms) as Generator<Source, T>
    }

    protected createStream<Target>(): Generator<Source, Target> {
        return new Generator<Source, Target>(this._source ? this._source : this as any);
    }

    public static stream<U>(): Generator<U, U> {
        return new Generator<U, U>();
    }
}

let gen = Generator.stream<number>().filter(i => i < 5);