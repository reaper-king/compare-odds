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
  race.set(input.map((rc,i)=>{
      return rc['race_no']

  }))

  race.subscribe(value => {
		currentRace.set(value[0]);
	});
  

}

getData()



</script>
 {#if input}
	 <!-- content here -->
	 {#each input as item}
		  <!-- content here -->
      {#if item.race_no == $race[ $race.indexOf($currentRace)]}
      <Table tableData={item.odds_compare} ></Table>	
      {/if}
	<!-- <Table tableData={item.odds_compare}></Table>	 -->
	 {/each}

 {/if}

 
 <style>
  :global(.bGroup){
      top:50%;
      left:50%;
        transform: translate(-50%,20%);
  }

  :global(.bGroup2){
      top:50%;
      left:50%;
        transform: translate(-10%,20%);
  }
 :global(.numB) {
background-color:        #409C2C;
  }




</style>
