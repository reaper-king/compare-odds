<script ang="ts" >
  import Table from "./components/table.svelte";
  import { race ,currentRace ,calDate } from './components/store'
  import Dropdown from './components/dropdown.svelte'
let calendarDate =0;

calDate.subscribe(value=> 
{calendarDate = value}
) ;

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

$: if(calendarDate !== 0 && calendarDate !== undefined){console.log(calendarDate)}

</script>

<Dropdown></Dropdown>

{#if input}
	 <!-- content here -->
	 {#each input as item}
		  <!-- content here -->
      {#if item.race_no == $race[ $race.indexOf($currentRace)]}
      <Table tableData={item.odds_compare} raceNum={item.race_no} startTime={item.start_time}></Table>	
      {/if}
	<!-- <Table tableData={item.odds_compare}></Table>	 -->
	 {/each}

 {/if}

 <style>
  :global(.bGroup){
      top:0%;
      left:50%;
        transform: translate(-50%,140%);
        z-index: 1;
  }

  :global(.bGroup2){
      top:50%;
      left:89%;
        transform: translate(0%,20%);
        z-index: 1;
        max-width: 200px;
  }

  
  :global(.bGroup3){
      top:5%;
    left:11%;
        transform: translate(0%,0%);
        z-index: 1;
        max-width: 200px;
        z-index: 2;
  }


 :global(.numB) {
background-color:        #409C2C;
  }




</style>
