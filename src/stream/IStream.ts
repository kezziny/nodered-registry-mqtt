import { IPublisher } from "./IPublisher";

export interface IStream<T> extends IPublisher<T> {
    changed(): IStream<T>;
    switchIfEmpty(value: T | (() => T)): IStream<T>;
    map<U>(transformation: ((value: T) => U)): IStream<U>;
    filter(filter: ((value: T) => Boolean)): IStream<T>;
    noPublishSince(ms: number): IStream<T>;
}