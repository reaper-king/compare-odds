<script>
    
  import { race ,currentRace  } from './store'
function setRace(raceNo){
    currentRace.set(raceNo)
}
    
</script>
<!-- <div class="bGroup flex relative items-center justify-center"> -->
    
    {#each $race as item}
    {#if $race.length == 1 }

    <button
    class="{$currentRace == item ? 'active' : ''} numB text-white hover:bg-green-300 hover:text-green-900 focus:bg-green-300 focus:text-green-900 font-bold uppercase text-sm px-6 py-3 outline-none focus:outline-none mb-1 ease-linear rounded transition-all duration-150"
    type="button"
    on:click={setRace(item)}>
    {item}

    </button>
    {:else if  $race.at(-1) == item}
    
   
    <button
    class="{$currentRace == item ? 'active' : ''} numB text-white hover:bg-green-300 hover:text-green-900 focus:bg-green-300 focus:text-green-900 font-bold uppercase text-sm px-6 py-3 outline-none focus:outline-none mb-1 ease-linear rounded-r transition-all duration-150"
    type="button"
    on:click={setRace(item)}>
    {item}

    </button>

  {:else if $race[0] == item }
    
    <button
    class="{$currentRace == item ? 'active' : ''} numB text-white hover:bg-green-300 hover:text-green-900 focus:bg-green-300 focus:text-green-900 font-bold uppercase  text-sm px-6 py-3 outline-none focus:outline-none mb-1 ease-linear rounded-l transition-all duration-150"
    type="button"
    on:click={setRace(item)}>
    {item}

    </button>

    {:else}

    <button
        class="{$currentRace == item ? 'active' : ''} numB text-white hover:bg-green-300 active:bg-green-300 hover:text-green-900  focus:text-green-900 focus:bg-green-300 font-bold uppercase text-sm px-6 py-3 outline-none focus:outline-none mb-1 ease-linear transition-all duration-150"
        type="button"
        on:click={setRace(item)}>
        {item}

    </button>

    {/if}
    
    {/each}
  <!-- </div> -->


  
 <style>

  .active {
  background-image: linear-gradient(#409C2C 95%, rgb(188, 247, 105) 10%);
    }
  
    
  
  
  </style>
  