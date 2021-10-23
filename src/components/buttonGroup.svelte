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
    class="{$currentRace == item ? 'active' : ''} rounded-r"
    type="button"
    on:click={setRace(item)}>
    {item}

    </button>

  {:else if $race[0] == item }
    
    <button
    class="{$currentRace == item ? 'active' : ''} rounded-l "
    type="button"
    on:click={setRace(item)}>
    {item}

    </button>

    {:else}

    <button
        class="{$currentRace == item ? 'active' : ''} rounded"
        type="button"
        on:click={setRace(item)}>
        {item}

    </button>

    {/if}
    
    {/each}
  <!-- </div> -->


  
 <style>


 .rounded-l{
    background-color: #409C2C; 
    box-shadow: 0 5px 5px -5px rgba(64, 155, 44,0.15), 0 10px 10px -5px rgba(64, 155, 44,0.15), 0 15px 15px -5px rgba(64, 155, 44,0.15), 0 20px 20px -5px rgba(64, 155, 44,0.15);
    transition-timing-function: linear;
    transition-duration: 150ms;
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4,0,0.2,1);
    transition-duration: 150ms;
    color: white;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 1rem;
    line-height: 1.25rem;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    
border: none;
    border-top-left-radius: 0.25rem;
    border-bottom-left-radius: 0.25rem;
    margin-bottom: 0.25rem;
    cursor: pointer;
    

}


.rounded-r{
    background-color: #409C2C; 
    box-shadow: 0 5px 5px -5px rgba(64, 155, 44,0.15), 0 10px 10px -5px rgba(64, 155, 44,0.15), 0 15px 15px -5px rgba(64, 155, 44,0.15), 0 20px 20px -5px rgba(64, 155, 44,0.15);
    transition-timing-function: linear;
    transition-duration: 150ms;
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4,0,0.2,1);
    transition-duration: 150ms;
    color: white;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 1rem;
    line-height: 1.25rem;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    
border: none;
    border-top-right-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
    margin-bottom: 0.25rem;
    cursor: pointer;
    

}


.rounded {
    background-color: #409C2C; 
    box-shadow: 0 5px 5px -5px rgba(64, 155, 44,0.15), 0 10px 10px -5px rgba(64, 155, 44,0.15), 0 15px 15px -5px rgba(64, 155, 44,0.15), 0 20px 20px -5px rgba(64, 155, 44,0.15);
    transition-timing-function: linear;
    transition-duration: 150ms;
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4,0,0.2,1);
    transition-duration: 150ms;
    color: white;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 1rem;
    line-height: 1.25rem;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    
border: none;
    margin-bottom: 0.25rem;
    cursor: pointer;
    

}


.rounded:hover ,.rounded-l:hover ,.rounded-r:hover {
    background-color: rgb(255, 255, 255); 
    color: rgb(104, 104, 104);
    
  background-image: linear-gradient(rgb(255, 255, 255) 95%, rgb(104, 104, 104) 20%);

}
/*
.numB:hover {
  background-color:rgb(67, 214, 34)  ;
  color: rgb(40, 44, 40);
} */
  .active {
  background-image: linear-gradient(#409C2C 95%, rgb(188, 247, 105) 20%);
  border-color: white !important;
    }
  
    
  
  
  </style>
  