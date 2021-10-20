<script>

    import { calDate } from './store';
let rd_options;
let selected;
const getData = async () => {
		const res = await fetch(`https://utxnaxbctngt41y-gra.adb.uk-london-1.oraclecloudapps.com/ords/gra/races/rd`);
		const text = await res.text();

		if (res.ok) {
			return JSON.parse(text).items;
		} else {
			throw new Error(text);
		}
  };

  let promise =  getData()

$: calDate.set(selected)   

</script>


{#await promise}
	<p>...loading</p>
{:then rd_options}
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

{:catch error}
	<p style="color: red">{error.message}</p>
{/await}


<style>


</style>