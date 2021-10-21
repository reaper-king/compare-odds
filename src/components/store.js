import { writable } from 'svelte/store';


export const race = writable([]);

export const currentRace = writable(0);

export const oddsCal = writable(0);

export const calDate = writable(0);

export const inputs = writable([]);

export const roptions = writable([]);




function Get(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}





export const getData = () => {

    let resp = Get('https://utxnaxbctngt41y-gra.adb.uk-london-1.oraclecloudapps.com/ords/gra/races/file/is.json');
    let resJson = JSON.parse(resp)
    console.log(resJson)
    roptions.set(resJson)
    calDate.set(resJson.r)

}


export function getTData() {
    let calendarDate
    calDate.subscribe(v => { calendarDate = v })
    let cRace;
    currentRace.subscribe(v => cRace = v)
    let resp = Get(`https://utxnaxbctngt41y-gra.adb.uk-london-1.oraclecloudapps.com/ords/gra/races/odds?meet=${calendarDate}`)
    let resJson = JSON.parse(resp)

    console.log(resJson.items)
    inputs.set(resJson.items)
    race.set(resJson.items.map((rc, i) => {
        return rc['race_no']

    }))
    if (cRace == 0) {
        race.subscribe(v => {
            currentRace.set(v[0])
        })

    }

}