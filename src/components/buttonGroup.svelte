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
    class="{$currentRace == item ? 'active' : ''} rounded "
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
        class="{$currentRace == item ? 'active' : ''} roundeds"
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
    font-size: 16px;
    line-height: 20px;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 24px;
    padding-right: 24px;
    
border: none;
    border-top-left-radius: 4px;
    border-bottom-left-radius:  4px;
    margin-bottom:  4px;
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
    font-size: 16px;
    line-height: 20px;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 24px;
    padding-right: 24px;
    
border: none;
    border-top-right-radius:  4px;
    border-bottom-right-radius:  4px;
    margin-bottom:  4px;
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
    font-size: 16px;
    line-height: 20px;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 24px;
    padding-right: 24px;
    
border: none;
    border-radius:  4px;
    margin-bottom: 4px;
    cursor: pointer;
    

}

.roundeds {
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
    font-size: 16px;
    line-height: 20px;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 24px;
    padding-right: 24px;
    
border: none;
    margin-bottom: 4px;
    cursor: pointer;
    

}


.rounded:hover ,.rounded-l:hover ,.rounded-r:hover , .roundeds:hover {
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
  