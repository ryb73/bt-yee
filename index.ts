import {delay} from "@ryb73/super-duper-parakeet/lib/src/fp/delay"
import noble, { Peripheral } from "@abandonware/noble";

const UUID_SERVICE = "95fe"

const HANDLE_AUTH = 3
const HANDLE_FIRMWARE_VERSION = 10
const HANDLE_AUTH_INIT = 19
const HANDLE_BEACON_KEY= 25

const MI_KEY1 = new Int8Array([0x90, 0xCA, 0x85, 0xDE])
const MI_KEY2 = new Int8Array([0x92, 0xAB, 0x54, 0xFA])
const SUBSCRIBE_TRUE = new Int8Array([0x01, 0x00])

async function authenticate(p: Peripheral) {
    await new Promise<void>(resolve => {
        p.discoverServices();
        // p.discoverServices([UUID_SERVICE], (err, services) => {
        //     console.log(`Discovered services?`, err, services);
        //     resolve();
        // });
        p.on(`servicesDiscover`, () => {
            resolve();
        })
    })
    // console.log(`??`, await p.discoverServicesAsync([UUID_SERVICE]));
    const service = p.services.find(s => s.uuid === UUID_SERVICE);
    console.log(`found service`, service);
    console.log(p.services);
}

async function connect(p: Peripheral) {
    console.log(`Found yee-rc`, p.address, p.advertisement);

    // const serviceDiscovery = new Promise<void>(resolve => {
    //     p.discoverServices([UUID_SERVICE], (err, services) => {
    //         console.log(`Discovered services?`, err, services);
    //         resolve();
    //     });
    // })

    p.on(`connect`, (error) => {
        console.log(`Connected?`, error);
    })

    p.on(`disconnect`, (error) => {
        console.log(`Disconnected?`, error);
    })

    p.on(`rssiUpdate`, (rssi) => {
        console.log(`RSSI`, rssi);
    })

    p.on(`servicesDiscover`, (services) => {
        console.log(`Discovered services?`, services);
    })

    await p.connectAsync();

    await delay(5000);

    // console.log(`Connected!`);

    // await serviceDiscovery;
    // console.log(`Discovered services?`);

    await authenticate(p);

    await p.disconnectAsync();

    console.log(`Disconnected.`);
}

let started = false;
async function start() {
    if(started) return;

    started = true;

    noble.on('discover', (p) => {
        if(p.address?.includes(`yee`) || p.advertisement.localName?.includes(`yee`)) {
            connect(p);
        }
    })

    await noble.startScanningAsync();
}

noble.on('stateChange', (state) => {
    console.log(`stateChange:`, state);
    if(state === 'poweredOn') {
        start().catch(e => console.error(e));
    }
})
