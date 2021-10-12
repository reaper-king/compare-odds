<script ang="ts" >
  import Table from "./components/table.svelte";
  import { writable } from 'svelte/store';
  import { race ,currentRace  } from './components/store'
    import jsonToPivotjson from "json-to-pivot-json";



let input
let output
async function getData() {
  const response = await fetch('https://utxnaxbctngt41y-gra.adb.uk-london-1.oraclecloudapps.com/ords/gra/races/odds');
  let tData = await response.json();
  input= tData.items;
  rLis = input.map((rc,i)=>{
      return rc['race_no']

  })


  race.set(input.map((rc,i)=>{
      return rc['race_no']

  }))

  race.subscribe(value => {
		currentRace.set(value[0]);
	});
  

}

getData()

let cRace ;
let rLis;
let rData;
let rIndx = 100;
currentRace.subscribe(value =>{cRace = value}
)

$: if(rIndx ){if(input){rIndx = rLis.indexOf(cRace)}}
// $: console.log(rLis.indexOf(cRace))
$: if(rIndx !== 100 ){console.log('rindx : '+rIndx)}

$: if(rIndx !== 100 ){if(input){ rData = input[rIndx].odds_compare}}

$: console.log(rData)
</script>
 {#if rIndx !== 100}
	<Table tableData={rData}></Table>	
 {/if}

 
 <style>
  :global(.bGroup){
      top:10%;
      left:50%;
        transform: translate(-50%,-50%);
  }

 :global(.numB) {
background-color:        #409C2C;
  }
</style>