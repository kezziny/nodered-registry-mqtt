import mqtt from 'mqtt';
import { Node, Argument, Event, ArgumentMap } from '@kezziny/nodered-registry-core';

export class MqttService extends Node {
    protected host: string = new Argument({ required: true, type: "string" }) as any;
    
    private client;

    private subscriptions: {[topic: string]: Event<MqttService.Package>} = {};

    init(args: MqttService.Args.Init) {
        super.init(args);

        this.status.yellow();
        this.client = mqtt.connect(this.host);
        this.client.on('connect', () => this.status.green());
        this.client.on('message', (topic, msg) => this.onMessage(topic, msg))
    }

    onMessage(topic, message) {
        try {
            let payload = JSON.parse(message.toString());
            this.subscriptions[topic].trigger({topic, payload});
        } catch (e) {
            //node.error(e);
            //node.error(e.stack);
        }
    }

    subscribe(args: MqttService.Args.Subscribe) {
        args = MqttService.Schema.Subscribe.eval(args) as any;
        this.client.subscribe(args.topic, {nl: args.nl});

        if (args.topic in this.subscriptions === false) this.subscriptions[args.topic] = new Event();
        this.subscriptions[args.topic].on(args.callback);
    }

    publish(args) {
        args = MqttService.Schema.Publish.eval(args);
        this.client.publish(args.topic, JSON.stringify(args.payload), {retain: args.retain});
    }
    
    destructor() {
        this.client.end();
        super.destructor();
    }
}

export namespace MqttService {
    export namespace Schema {
        export const Subscribe = new ArgumentMap({
            topic: {required: true, type: "string"},
            callback: {required: true},
            nl: {required: true, default: false},
        });
    
        export const Publish = new ArgumentMap({
            topic: { required: true, type: "string" },
            payload: { required: true },
            retain: { required: true, default: false, type: "boolean" },
        });
    }

    export namespace Args {
        export interface Init extends Node.Args.Init {
            host: string
        }

        export interface Subscribe {
            topic: string;
            callback: SubscriptionCallback;
            nl?: boolean;
        }
    }

    export type Package = {topic: string, payload: any};
    export type SubscriptionCallback = (MqttData) => void;
}