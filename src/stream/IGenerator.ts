import { IStream } from "./IStream";

export interface IGenerator<Source, T> extends IStream<T> {
    generate(data: Source | Error): void;
    changed(): IGenerator<Source, T>;
    switchIfEmpty(value: T | (() => T)): IGenerator<Source, T>;
    map<U>(transformation: ((value: T) => U)): IGenerator<Source, U>;
    filter(filter: ((value: T) => Boolean)): IGenerator<Source, T>;
    noPublishSince(ms: number): IGenerator<Source, T>;
}