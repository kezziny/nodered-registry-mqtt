import { MqttService } from './MqttService';

import { ArgumentMap, Argument, Property, PropertyGroup } from '@kezziny/nodered-registry-core';

export class MqttPlugin extends Node {
    private mqttService: MqttService = new Argument({required: true, type: MqttService}) as any;

    // topic -> .set, .command -> /set
    private subscribeProperty(args: MqttPlugin.PropertySchema) {
        args = MqttPlugin.Schema.PropertySchema.eval(args) as any;

        args.property.requested.on(command => {
            let payload = {};
            payload[args.name] = args.outgoingConverter(command);
            this.mqttService.publish({
                topic: `${args.topic}/set`,
                payload,
                retain: args.retain
            });
        });

        this.mqttService.subscribe({
            topic: args.topic, 
            callback: (data: MqttService.Package) => {
                if (args.name in data.payload) {
                    args.property.value = args.incomingConverter(data.payload[args.name]);
                }
            }
        });
    }

    // /->set, .command -> /set
    public subscribe(args: MqttPlugin.Args.Group) {
        /*if (Array.isArray(args)) {
            args.forEach(arg => {
                this.subscribe(arg);
            });
            return;
        }*/
        args = MqttPlugin.Schema.Group.eval(args) as any;

        for (const key in args.group) {
            if (args.group[key] instanceof Property === false) continue;

            this.subscribeProperty(
                Object.assign({
                        topic: args.topic,
                        name: key,
                        property: args.group[key],
                        retain: args.retain
                    },
                    args.properties[key]
                )
            );
        }
    }

    publish(args: MqttPlugin.Args.Group) {
        // .changed -> /, /set -> .command
        args = MqttPlugin.Schema.Group.eval(args) as any;
        let resources = [];

        for (const key in args.group) {
            if (args.group[key] instanceof Property === false) continue;

            args.properties[key] = MqttPlugin.Schema.PropertyParser.eval(args.properties[key]) as any;
        }

        resources.push(
            args.group.changed.on(() => {
                let message = {};
                for (const key in args.group) {
                    if (args.group[key] instanceof Property === false) continue;
                    
                    message[key] = args.properties[key].outgoingConverter(args.group[key].value);
                }

                this.mqttService.publish({ topic: args.topic, payload: message, retain: args.retain });
            })
        );

        this.mqttService.subscribe({
            topic: `${args.topic}/set`,
            callback: (data: MqttService.Package) => {
                for (const key in data.payload) {
                    if (!args.properties.hasOwnProperty(key)) continue;

                    args.group[key].command(args.properties[key].incomingConverter(data.payload[key]));
                }
            }
        });

        if (!args.restore) return;
        
        this.mqttService.subscribe({
            topic: `${args.topic}`,
            callback: (data: MqttService.Package) => {
                for (const key in data.payload) {
                    if (!args.properties.hasOwnProperty(key)) continue;

                    args.group[key].set(args.properties[key].incomingConverter(data.payload[key]));
                }
            },
            nl: true,
        });
    }
}

export namespace MqttPlugin {
    export namespace Args {
        export interface Group {
            topic: string,
            group: PropertyGroup,
            retain?: boolean,
            restore?: boolean,
            properties?: {[key: string]: PropertySchema},
        }
    
    }
    
    export interface PropertySchema {
        topic: string,
        name: string,
        property: Property<any>,
        retain?: boolean,
        incomingConverter?: (data: any) => any,
        outgoingConverter?: (data: any) => any,
    }

    export interface PropertyParser {
        incomingConverter?: (data: any) => any,
        outgoingConverter?: (data: any) => any,
    }

    export namespace Schema {
        class Converters {
            static Identical = (data) => data;
        }
        
        export const Group = new ArgumentMap({
            topic: { required: true, type: "string" },
            group: { required: true, type: PropertyGroup },
            retain: { required: true, default: false, type: "boolean" },
            restore: { required: true, default: false },
            properties: { required: true, default: {} },
        });
    
        export const PropertySchema = new ArgumentMap({
            topic: { required: true, type: "string" },
            property: { required: true, type: Property },
            name: { required: true, type: "string" },
            incomingConverter: { required: true, default: (context) => Converters.Identical },
            outgoingConverter: { required: true, default: (context) => Converters.Identical },
            retain: { required: true, default: false, type: "boolean" },
        });
    
        export const PropertyParser = new ArgumentMap({
            name: { required: false, type: "string" },
            incomingConverter: { required: true, default: (context) => Converters.Identical },
            outgoingConverter: { required: true, default: (context) => Converters.Identical },
        });
    }
}