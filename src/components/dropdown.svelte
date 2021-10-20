<script>
  import { calDate , getData  , roptions} from './store';
  
getData()

</script>
<div id="ddown" class="absolute bGroup3">
<select bind:value={$calDate}  class="relative block appearance-none  bg-green-100 border border-green-500 hover:border-green-700 px-4 py-3 pr-4 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
  {#if $roptions}
 {#each $roptions as opt}  
 <option value={opt.r}>{opt.race_date}</option>
 {/each}
 {:else}
  
 <option value="">No Meetings</option>
  {/if}
</select>
</div>