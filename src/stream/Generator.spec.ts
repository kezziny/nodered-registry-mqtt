const each = require("jest-each").default;
jest.useFakeTimers();

import { Generator } from './Generator';

describe('Publisher', () => {
    let source: Generator<string, string> = null;
    let result: string = null;

    beforeEach(() => {
        source = Generator.stream<string>();
        result = undefined;
    });

    it('publish', async () => {
        source.onNext(i => result = i);

        source.publish("ok");

        expect(source.value).toBe("ok");
        expect(result).toBe("ok");
    });

    it('publish empty', async () => {
        source.onEmpty(() => result = "empty");

        source.publish("prev");
        expect(source.value).toBe("prev");

        source.publish(undefined);
    

        expect(source.value).toBe(undefined);
        expect(result).toBe("empty");
    });

    it('publish error', async () => {
        source.onError(i => result = "error");

        source.publish("prev");
        expect(source.value).toBe("prev");

        source.publish(new Error());

        expect(source.value).toBe("prev");
        expect(result).toBe("error");
    });

    describe('switchIfEmpty', () => {
        each([
            ["const", false],
            ["function", true]
          ]).describe("argument - %s", (_, isFunction) => {
            let publisher: Generator<string, string> = null;

            beforeEach(() => {
                if (isFunction) {
                    publisher = source.switchIfEmpty(() => "switched");
                } else {
                    publisher = source.switchIfEmpty("switched");
                }
            })
    
            it('publish on parent', async () => {
                publisher.onNext(i => result = i);

                publisher.generate("ok");

                expect(publisher.value).toBe("ok");
                expect(result).toBe("ok");
            });
    
            it('publish empty on parent', async () => {
                publisher.onNext(i => result = i);

                publisher.generate(undefined);

                expect(publisher.value).toBe("switched");
                expect(result).toBe("switched");
            });
    
            it('publish error on parent', async () => {
                publisher.onError(_ => result = "error");

                publisher.generate(new Error());

                expect(publisher.value).toBe(undefined);
                expect(result).toBe("error");
            });
          })
    });

    describe('changed', () => {
        let publisher: Generator<string, string> = null;
        let counter;

        beforeEach(() => {
            publisher = source.changed();
            counter = 0;
        })

        it('publish on parent', async () => {
            publisher.onNext(_ => counter++);

            publisher.generate("ok");

            expect(publisher.value).toBe("ok");
            expect(counter).toBe(1);

            publisher.generate("ok");

            expect(publisher.value).toBe("ok");
            expect(counter).toBe(1);
        });

        it('publish empty on parent', async () => {
            publisher.onNext(_ => counter++);
            publisher.onEmpty(() => result = "empty");

            publisher.generate("ok");
            expect(publisher.value).toBe("ok");
            expect(counter).toBe(1);

            publisher.generate(undefined);
            expect(publisher.value).toBe(undefined);
            expect(result).toBe("empty");
            expect(counter).toBe(1);
        });

        it('publish error on parent', async () => {
            publisher.onNext(_ => counter++);
            publisher.onError(_ => result = "error");

            publisher.generate("ok");
            expect(publisher.value).toBe("ok");
            expect(counter).toBe(1);

            publisher.generate(new Error());
            expect(publisher.value).toBe("ok");
            expect(result).toBe("error");
            expect(counter).toBe(1);
        });
    });

    describe('map', () => {
        let publisher: Generator<string, string> = null;

        beforeEach(() => {
            publisher = source.map(v => v + v);
        })

        it('publish on parent', async () => {
            publisher.onNext(i => result = i);

            publisher.generate("ok");

            expect(publisher.value).toBe("okok");
            expect(result).toBe("okok");
        });

        it('publish empty on parent', async () => {
            publisher.onEmpty(() => result = "empty");

            publisher.generate("ok");
            expect(publisher.value).toBe("okok");

            publisher.generate(undefined);
            expect(publisher.value).toBe(undefined);
            expect(result).toBe("empty");
        });

        it('publish error on parent', async () => {
            publisher.onError(_ => result = "error");

            publisher.generate("ok");
            expect(publisher.value).toBe("okok");

            publisher.generate(new Error());
            expect(publisher.value).toBe("okok");
            expect(result).toBe("error");
        });
    });

    describe('filter', () => {
        let publisher: Generator<string, string> = null;

        beforeEach(() => {
            publisher = source.filter(v => v === "ok");
        })

        it('publish on parent', async () => {
            publisher.onNext(i => result = i);

            publisher.generate("ok");

            expect(publisher.value).toBe("ok");
            expect(result).toBe("ok");

            publisher.generate("nok");

            expect(publisher.value).toBe(undefined);
            expect(result).toBe("ok");
        });

        it('publish empty on parent', async () => {
            publisher.onEmpty(() => result = "empty");

            publisher.generate("ok");
            expect(publisher.value).toBe("ok");

            publisher.generate(undefined);
            expect(publisher.value).toBe(undefined);
            expect(result).toBe("empty");
        });

        it('publish error on parent', async () => {
            publisher.onError(_ => result = "error");

            publisher.generate("ok");
            expect(publisher.value).toBe("ok");

            publisher.generate(new Error());
            expect(publisher.value).toBe("ok");
            expect(result).toBe("error");
        });
    });

    describe('noPublishSince', () => {
        let publisher: Generator<string, string> = null;

        beforeEach(() => {
            publisher = source.noPublishSince(100);
        })

        it('publish on parent', async () => {
            publisher.onNext(i => result = i);

            publisher.generate("ok");
            expect(publisher.value).toBe(undefined);
            expect(result).toBe(undefined);
            
            jest.runAllTimers();
            expect(publisher.value).toBe("ok");
            expect(result).toBe("ok");
        });

        it('publish empty on parent', async () => {
            publisher.onEmpty(() => result = "empty");

            publisher.generate(undefined);
            expect(publisher.value).toBe(undefined);
            expect(result).toBe("empty");
        });

        it('publish error on parent', async () => {
            publisher.onError(_ => result = "error");

            publisher.generate("ok");
            expect(publisher.value).toBe(undefined);
            
            jest.runAllTimers();
            expect(publisher.value).toBe("ok");

            publisher.generate(new Error());
            expect(publisher.value).toBe("ok");
            expect(result).toBe("error");
        });
    });
});