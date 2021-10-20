<script>

    import { calDate } from './store';
let rd_options;
let selected;
const getData = async () => {
		const response  = await fetch('https://utxnaxbctngt41y-gra.adb.uk-london-1.oraclecloudapps.com/ords/gra/races/rd',
		{
    credentials: 'same-origin',
  headers: {
    'APP_USER': 'AJAY'
  }
});

    let tData = await response.json();
     rd_options = tData.items;
     selected = rd_options[0].r

    };

  getData()

$: calDate.set(selected)   

</script>
<div id="ddown" class="absolute bGroup3">
<select bind:value={selected} on:change="{() => calDate.set(selected)}"  class="relative block appearance-none  bg-green-100 border border-green-500 hover:border-green-700 px-4 py-3 pr-4 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
    {#if rd_options}
   {#each rd_options as opt}  
   <option value={opt.r}>{opt.race_date}</option>
   {/each}
   {:else}
    
   <option value="">No Meetings</option>
    {/if}
</select>
</div>
<style>

</style>