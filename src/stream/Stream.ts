import { IStream } from "./IStream";
import { IGenerator } from './IGenerator';

export type StreamOf<T> = {[key in keyof T]: Stream<T[key]>};

export class Stream<T> implements IStream<T> {
    protected _onNext:((value: T) => void)[] = [];
    protected _onEmpty:(() => void)[] = [];
    protected _onError:((error: Error) => void)[] = [];
    private _value:T = undefined;

    public get value() { return this._value; }

    public publish(value:T | Error): boolean {
        if (value instanceof Error) {
            for(let subscriber of this._onError) {
                subscriber(value);
            }
        } else if (value === undefined || value === null) {
            this._value = value;
            for(let subscriber of this._onEmpty) {
                subscriber();
            }
        } else {
            this._value = value;
            for(let subscriber of this._onNext) {
                subscriber(value);
            }
        }
        
        return true;
    }

    public onNext(subscriber: (value: T) => void): Stream<T> {
        this._onNext.push(subscriber);
        return this;
    }

    public onError(subscriber: (error: Error) => void): Stream<T> {
        this._onError.push(subscriber);
        return this;
    }

    public onEmpty(subscriber: () => void): Stream<T> {
        this._onEmpty.push(subscriber);
        return this;
    }

    private _changed: Stream<T> = null;
    public changed(): Stream<T> {
        if (this._changed === null) {
            this._changed = this.createStream<T>();
            this._changed.publish(this._value);
            this.onEmpty(() => this._changed.publish(undefined));
            this.onError(e => this._changed.publish(e));
            this.onNext(value => {
                if (value !== this._changed.value) {
                    this._changed.publish(value);
                }
            });
        }

        return this._changed;
    }

    public switchIfEmpty(value: T | (() => T)): Stream<T> {
        let publisher = this.createStream<T>();
        this.onNext(v => publisher.publish(v));
        this.onError(e => publisher.publish(e));
        this.onEmpty(() => {
            if (this.isCallback<() => T>(value)) {
                publisher.publish(value());
            } else {
                publisher.publish(value);
            }
        })
        return publisher;
    }

    public map<U>(transformation: U | ((value: T) => U)): Stream<U> {
        let publisher = this.createStream<U>();
        this.onError(e => publisher.publish(e));
        this.onEmpty(() => publisher.publish(undefined));
        this.onNext(event => {
            if (this.isCallback<(T) => U>(transformation))
                publisher.publish(transformation(event));
            else
                publisher.publish(transformation);
        });
        return publisher;
    }

    public flatMap<U>(generator: IGenerator<T, U>): IStream<U> {
        this.onNext(data => generator.generate(data));
        this.onError(e => generator.generate(e));
        this.onEmpty(() => generator.generate(undefined));
        return generator;
     }

    public filter(filter: ((value: T) => Boolean)): Stream<T> {
        let publisher = this.createStream<T>();
        this.onError(e => publisher.publish(e));
        this.onEmpty(() => publisher.publish(undefined));
        this.onNext(value => {
            if (filter(value))
                publisher.publish(value);
            else
                publisher.publish(undefined);
        });
        return publisher;
    }

    public case(filter: ((value: T) => Boolean) | T, handle: (stream: Stream<T>) => void) {
        let publisher = this.createStream<T>();
        let other = this.createStream<T>();
        handle(publisher);
        
        this.onEmpty(() => other.publish(undefined));
        this.onError(e => other.publish(e));
        this.onNext(value => {
            if (this.isCallback<(T) => boolean>(filter)) {
                if (filter(value)) publisher.publish(value)
                else other.publish(value);
            } else {
                if (filter === value) publisher.publish(value)
                else other.publish(value);
            }
        });
        return other;
    }

    public noPublishSince(ms: number): Stream<T> {
        let publisher = this.createStream<T>();
        this.onError(e => publisher.publish(e));
        this.onEmpty(() => publisher.publish(undefined));
        let timeout = null;
        this.onNext(value => {
            if (timeout !== null) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                publisher.publish(value);
            }, ms);
        });
        return publisher;
    }

    public static of<T>(...streams: Stream<T>[]):Stream<T> {
        let publisher = new Stream<T>();
        streams.forEach(s => s.onNext(value => publisher.publish(value)));
        return publisher;
    }

    public static combine<T>(map: { [key in keyof T]: Stream<T[key]> }): Stream<T> {
        let publisher = new Stream<T>();
        let initialized = false;
        for (let key in map) {
            map[key].onNext(event => {
                let value:any = {};
                let hasEmpty = false;
                for (let k in map) {
                    value[k] = map[k].value;
                    if (map[k].value === undefined) hasEmpty = true;
                }
                if (!hasEmpty) initialized = true;
                else if (!initialized) return;
                publisher.publish(value);
            });
        }

        return publisher;
    }

    public static just<T>(value: T): Stream<T> {
        let stream = new Stream<T>();
        stream.publish(value);
        return stream;
    }

    public static ofArray<T>(...streams: Stream<T>[]): Stream<T[]> {
        let publisher = new Stream<T[]>();
        streams.forEach(s => s.onNext(event => publisher.publish(streams.map(s => s.value))));
        return publisher;
    }

    public static mergeConditionally<T>(...streams: { if: Stream<boolean>, then: Stream<T> }[]): Stream<T[]> {
        let publisher = new Stream<T[]>();
        Stream.of<any>(...streams.map(s => s.if).concat(streams.map(s => s.then as Stream<any>)))
            .onNext(() => {
                publisher.publish(streams.filter(s => s.if.value).map(s => s.then.value));
            });
        return publisher;
    }

    public static empty():undefined {
        return undefined;
    }

    protected createStream<Target>(): Stream<Target> {
        return new Stream<Target>();
    }

    private isCallback<T>(source: T | unknown): source is T {
        return typeof source === 'function';
      }
}