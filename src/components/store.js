import { writable } from 'svelte/store';

export const race = writable([]);

export const currentRace = writable(0);

export const oddsCal = writable(0);

export const calDate = writable(0);

export const inputs = writable([]);

export const roptions = writable([]);

export const getData = async() => {

    fetch('https://utxnaxbctngt41y-gra.adb.uk-london-1.oraclecloudapps.com/ords/gra/races/rd')
        .then(response => response.json())
        .then(resp => {
            console.log(resp.items)
            roptions.set(resp.items)
            calDate.set(resp.items[0].r)
        })

    .catch(err => {
        console.error(err);
    })
};


export async function getTData() {
    let calendarDate
    calDate.subscribe(v => { calendarDate = v })
    let cRace;
    currentRace.subscribe(v => cRace = v)
    fetch(`https://utxnaxbctngt41y-gra.adb.uk-london-1.oraclecloudapps.com/ords/gra/races/odds?meet=${calendarDate}`)
        .then(response => response.json())
        .then(resp => {
            console.log(resp.items)
            inputs.set(resp.items)
            race.set(resp.items.map((rc, i) => {
                return rc['race_no']

            }))
            if (cRace == 0) {
                race.subscribe(v => {
                    currentRace.set(v[0])
                })

            }

        })

}