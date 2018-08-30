var assert = require('chai').assert;
var EventBus = require('../build/EventBus').default;

var callback1 = (evtName, data) => {
    console.log('CALLBACK LOG', 'Hello ' + data.name);
};

var callback2 = (evtName, data) => {
    console.log('CALLBACK LOG', 'Goodbye ' + data.name);
};


describe('adding events', () => {

    // 1. ARRANGE

    var eventBus = [];

    var eventName = {
        'MY_EVENT_NAME': 'MyEventName'
    };
    var eventNamespace = 'ns1.ns2.ns3';
    var fullEventName = eventName['MY_EVENT_NAME'] + '.' + eventNamespace;
    var fullEventNameParts = fullEventName.split('.');


    // 2.0 ACT
    eventBus.push(new EventBus());
    eventBus[0].on(fullEventName, callback1);

    // 3.0 ASSERT
    it('subscriptions should be an array', () => {
        assert.isArray(eventBus[0].subscriptions[eventName['MY_EVENT_NAME']]);
    });

    it('subscriptions should be length of 1', () => {
        assert.lengthOf(eventBus[0].subscriptions[eventName['MY_EVENT_NAME']], 1);
    });

    it('the one subscription should have full namespace', () => {
        assert.equal(eventBus[0].subscriptions[eventName['MY_EVENT_NAME']][0].name, fullEventName);
    });

    it('the only subscription should have full namespace parts', () => {
        assert.deepEqual(eventBus[0].subscriptions[eventName['MY_EVENT_NAME']][0].parts, fullEventNameParts);
    });

    it('the only subscription should have callback1', () => {
        assert.equal(eventBus[0].subscriptions[eventName['MY_EVENT_NAME']][0].callback, callback1);
    });

    /*
    
    // 2.1 ACT
    eventBus.push(new EventBus());
    eventBus[1].on(fullEventName, callback1);

    // 3.1 ASSERT
    it('subscriptions should be an array', () => {
        assert.isArray(eventBus[1].subscriptions[eventName['MY_EVENT_NAME']]);
    });

    */

});

describe('removing events', () => {

    // 1. ARRANGE
    var eventBus = [];

    var eventName = 'MyEventName';
    var eventNamespace = 'ns1.ns2.ns3';
    var fullEventName = eventName + '.' + eventNamespace;


    // 2.0 PRE ACT
    eventBus.push(new EventBus());
    eventBus[0].on(eventName, callback2);
    eventBus[0].on(fullEventName, callback1);

    // 3.0 PRE ASSERT
    it('PRE TEST // added 2 events', () => {
        assert.lengthOf(eventBus[0].subscriptions[eventName], 2);
    });

    // 2.1 ACT
    eventBus.push(new EventBus());
    eventBus[1].on(eventName, callback2);
    eventBus[1].on(fullEventName, callback1);
    eventBus[1].off(fullEventName, callback1);

    // 3.1 ASSERT
    it('remove 1 of 2 with full event name and callback', () => {
        assert.lengthOf(eventBus[1].subscriptions[eventName], 1);
    });

    // 2.2 ACT
    eventBus.push(new EventBus());
    eventBus[2].on(eventName, callback2);
    eventBus[2].on(fullEventName, callback1);
    eventBus[2].off(fullEventName);

    // 3.2 ASSERT
    it('remove 1 of 2 with full event name', () => {
        assert.lengthOf(eventBus[2].subscriptions[eventName], 1);
    });

    // 2.3 ACT
    eventBus.push(new EventBus());
    eventBus[3].on(eventName, callback2);
    eventBus[3].on(fullEventName, callback1);
    eventBus[3].off(eventName, callback1);

    // 3.3 ASSERT
    it('remove 1 of 2 with basic event name and callback', () => {
        assert.lengthOf(eventBus[3].subscriptions[eventName], 1);
    });

    // 2.4 ACT
    eventBus.push(new EventBus());
    eventBus[4].on(eventName, callback2);
    eventBus[4].on(fullEventName, callback1);
    eventBus[4].off(eventName);

    // 3.4 ASSERT
    it('remove 2 of 2 with basic event name', () => {
        assert.lengthOf(eventBus[4].subscriptions[eventName], 0);
    });

    // 2.5 ACT
    eventBus.push(new EventBus());
    eventBus[5].on(eventName, callback2);
    eventBus[5].on(fullEventName, callback1);
    eventBus[5].off('.' + eventNamespace, callback1);

    // 3.5 ASSERT
    it('remove 1 of 2 with namespace only and callback', () => {
        assert.lengthOf(eventBus[5].subscriptions[eventName], 1);
    });

    // 2.6 ACT
    eventBus.push(new EventBus());
    eventBus[6].on(eventName, callback2);
    eventBus[6].on(fullEventName, callback1);
    eventBus[6].off('.' + eventNamespace);

    // 3.6 ASSERT
    it('remove 1 of 2 with namespace only', () => {
        assert.lengthOf(eventBus[6].subscriptions[eventName], 1);
    });

    // 2.7 ACT
    eventBus.push(new EventBus());
    eventBus[7].on(eventName, callback2);
    eventBus[7].on(fullEventName, callback1);
    eventBus[7].off(undefined, callback1);

    // 3.7 ASSERT
    it('remove 1 of 2 with callback only', () => {
        assert.lengthOf(eventBus[7].subscriptions[eventName], 1);
    });

    // 2.8 ACT
    eventBus.push(new EventBus());
    eventBus[8].on(eventName, callback2);
    eventBus[8].on(fullEventName, callback1);
    eventBus[8].off();

    // 3.8 ASSERT
    it('remove 2 of 2 with wildcard', () => {
        assert.lengthOf(eventBus[8].subscriptions[eventName], 0);
    });


});
