export interface IPublisher<T> {
    publish(data: T): boolean;
}