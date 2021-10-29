<script>
  import { onMount } from "svelte";


  onMount(()=>{
getData()});

let calendarDate =0;

calDate.subscribe(value=> 
{calendarDate = value}
) ;

$: if(calendarDate !== 0 && calendarDate !== undefined){
getTData() ;  
}


  import jsonToPivotjson from "json-to-pivot-json";
  
  import { calDate , getData  , roptions , race , getTData , inputs , currentRace,oddsCal } from './store';
  import { fly, fade ,blur ,slide} from 'svelte/transition';
  import Bet from "./betCalc.svelte";
  import ButtonGroup from "./buttonGroup.svelte";
  import OddsCal from "./oddsCal.svelte";
  
let input;
let races ;
let currRace ;
inputs.subscribe(v=>input = v)
currentRace.subscribe(v=>currRace=v)
race.subscribe(v=>races = v)

$: tableData = input[races.indexOf(currRace)];
let tableData 

  var options = {
  row: "horse_no", 
  column: "bookmaker", 
  value: "amount"
};
let output


$: if(tableData){ output = jsonToPivotjson(tableData.odds_compare, options);}; 

function horse(hrs_no) {

  let hrs =  tableData.odds_compare[tableData.odds_compare.map(function (x) { return x.horse_no; }).indexOf(hrs_no)].horse;
  return hrs
   
   }

   function jockey(hrs_no) {

let jock =  tableData.odds_compare[tableData.odds_compare.map(function (x) {return x.horse_no; }).indexOf(hrs_no)].jockey;

let wght = tableData.odds_compare[tableData.odds_compare.map(function (x) { return x.horse_no; }).indexOf(hrs_no)].weight;
return jock+ " (" + wght + "kg)"

}

let bet;
let show = false;
let selectedHorse , selectedBookie , selectedOdds

</script>
{#if show}
<div class="overlay"  on:click|stopPropagation|preventDefault={()=>show = false} in:blur={{ y: 50, duration: 1000 }} out:blur={{ y: -50, duration: 1000 }}>
  <div class="betCalc" in:fly={{ y: 100, duration: 1000 }}  out:fly={{ y: -100, duration: 1000 }} on:click|stopPropagation>
  
<!--  -->


<h3 in:fly={{ y: -50, duration: 2300 }}>
  Betting Calculator</h3>
  
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" in:fly={{ y: -50, duration: 2500 }}>
<g>
<circle style="fill:#419c2c21;" cx="256" cy="256" r="256"/>
<path style="fill:rgba(98, 126, 105,0.5);" d="M493.297,352.061l-0.553-0.276L289.065,135.808l-96.123-48.061l-96.123,48.061V259.2
   l120.909,119.711l8.54,24.94l90.788,100.772C397.348,484.961,462.74,427.459,493.297,352.061z"/>
<polygon style="fill:#04ad0c;" points="289.065,135.808 192.942,183.875 96.819,135.808 192.942,87.747 	"/>
<polygon style="fill:#04ad0c;" points="192.942,306.278 96.819,259.2 96.819,135.808 192.942,183.875 	"/>
<polygon style="fill:#006b05;" points="192.942,306.278 289.065,259.2 289.065,135.808 192.942,183.875 	"/>
<path style="fill:#FFFFFF;" d="M153.882,221.379c0,6.733-4.029,10.706-9.001,8.873c-4.972-1.833-9.001-8.781-9.001-15.514
   c0-6.733,4.029-10.706,9.001-8.873C149.852,207.703,153.882,214.646,153.882,221.379z"/>
<path style="fill:#FFFFFF;" d="M234.813,222.74c0,6.733,4.029,10.706,9.001,8.873c4.972-1.833,9.001-8.781,9.001-15.514
   c0-6.733-4.029-10.706-9.001-8.873C238.843,209.065,234.813,216.008,234.813,222.74z"/>
<path style="fill:#FFFFFF;" d="M205.553,205.768c0,6.733,4.029,10.706,9.001,8.873s9.001-8.781,9.001-15.514
   s-4.029-10.706-9.001-8.873S205.553,199.035,205.553,205.768z"/>
<path style="fill:#FFFFFF;" d="M205.553,272.256c0,6.733,4.029,10.706,9.001,8.873c4.972-1.833,9.001-8.781,9.001-15.514
   s-4.029-10.706-9.001-8.873S205.553,265.523,205.553,272.256z"/>
<path style="fill:#FFFFFF;" d="M260.465,178.693c0,6.733,4.029,10.706,9.001,8.873s9.001-8.781,9.001-15.514
   c0-6.733-4.029-10.706-9.001-8.873C264.499,165.012,260.465,171.955,260.465,178.693z"/>
<path style="fill:#FFFFFF;" d="M260.465,245.181c0,6.733,4.029,10.706,9.001,8.873c4.972-1.833,9.001-8.781,9.001-15.514
   s-4.029-10.706-9.001-8.873S260.465,238.449,260.465,245.181z"/>
<path style="fill:#FFFFFF;" d="M123.571,176.292c0,6.733-4.029,10.706-9.001,8.873c-4.972-1.833-9.001-8.781-9.001-15.514
   c0-6.733,4.029-10.706,9.001-8.873C119.542,162.611,123.571,169.559,123.571,176.292z"/>
<path style="fill:#FFFFFF;" d="M180.122,270.459c0,6.733-4.029,10.706-9.001,8.873c-4.972-1.833-9.001-8.781-9.001-15.514
   c0-6.733,4.029-10.706,9.001-8.873C176.092,256.783,180.122,263.726,180.122,270.459z"/>
<ellipse style="fill:#FFFFFF;" cx="192.942" cy="135.808" rx="12.611" ry="8.53"/>
<polygon style="fill:#009708;" points="414.776,351.278 312.822,317.292 278.835,215.337 380.79,249.324 	"/>
<polygon style="fill:#04ad0c;" points="226.263,403.845 191.585,302.587 278.835,215.337 312.822,317.292 	"/>
<polygon style="fill:#006b05;" points="226.263,403.845 327.526,438.528 414.776,351.278 312.822,317.292 	"/>
<path style="fill:#FFFFFF;" d="M306.253,341.693c-4.762,4.762-4.721,10.419,0.092,12.641c4.813,2.217,12.575,0.159,17.336-4.603
   c4.762-4.762,4.721-10.419-0.092-12.641S311.014,336.932,306.253,341.693z"/>
<path style="fill:#FFFFFF;" d="M259.236,388.705c-4.762,4.762-4.721,10.419,0.092,12.641c4.813,2.217,12.575,0.159,17.336-4.603
   c4.762-4.762,4.721-10.419-0.092-12.641C271.759,381.88,263.997,383.944,259.236,388.705z"/>
<path style="fill:#FFFFFF;" d="M336.599,351.862c-4.762,4.762-4.721,10.419,0.092,12.641c4.813,2.222,12.575,0.159,17.336-4.603
   s4.721-10.419-0.092-12.641C349.123,345.037,341.361,347.1,336.599,351.862z"/>
<path style="fill:#FFFFFF;" d="M289.582,398.879c-4.762,4.762-4.721,10.419,0.092,12.641c4.813,2.217,12.575,0.159,17.336-4.603
   c4.762-4.762,4.721-10.419-0.092-12.641S294.344,394.117,289.582,398.879z"/>
<path style="fill:#FFFFFF;" d="M364.232,361.375c-4.762,4.762-4.721,10.419,0.092,12.641c4.813,2.217,12.575,0.159,17.336-4.603
   s4.721-10.419-0.092-12.641C376.755,354.555,368.993,356.613,364.232,361.375z"/>
<path style="fill:#FFFFFF;" d="M317.215,408.392c-4.762,4.762-4.721,10.419,0.092,12.641c4.813,2.217,12.575,0.159,17.336-4.603
   c4.762-4.762,4.721-10.419-0.092-12.641C329.738,401.567,321.976,403.63,317.215,408.392z"/>
<path style="fill:#FFFFFF;" d="M269.128,262.881c-4.762,4.762-10.419,4.721-12.641-0.092c-2.217-4.813-0.159-12.575,4.603-17.336
   c4.762-4.762,10.419-4.721,12.641,0.092C275.953,250.358,273.889,258.12,269.128,262.881z"/>
<path style="fill:#FFFFFF;" d="M242.529,369.454c-4.762,4.762-10.419,4.721-12.641-0.092c-2.217-4.813-0.159-12.575,4.603-17.336
   s10.419-4.721,12.641,0.092S247.291,364.692,242.529,369.454z"/>

   <ellipse transform="matrix(0.7071 -0.7071 0.7071 0.7071 -98.7293 328.1921)" style="fill:#FFFFFF;" cx="346.798" cy="283.273" rx="8.53" ry="12.61"/>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
</svg>

<h4 in:fly={{ y: -50, duration: 2300 }}>{selectedBookie}</h4>
<h4 in:fly={{ y: 50, duration: 2300 }}>{selectedHorse}</h4>
<input class="bet" type="number" placeholder="Bet" bind:value={bet} in:fly={{ y: 50, duration: 2300 }}>
<h5 in:fly={{ y: 50, duration: 2300 }}>Payout:</h5>

<h5 in:fly={{ y: 50, duration: 2300 }}>
  {#if isNaN( (bet * selectedOdds) / 100) }
     0

     {:else}
       {(bet * selectedOdds) / 100}
  {/if} 
</h5>

<button class="rounded" type="button" on:click={()=>show = false} in:fly={{ y: 50, duration: 2300 }}>ok</button>
  </div> 



<!--  -->
</div>
{/if}

{#if output}
<div class="caption" id="caption">
  <select bind:value={$calDate} class="selectList" >
      
  {#if $roptions}
 {#each $roptions as opt}  
 <option value={opt.r}>{opt.race_date}</option>
 {/each}
 {:else}
  
 <option value="">No Meetings</option>
  {/if}
</select>
<div class="racebut"><ButtonGroup/></div>

<div class="oddscal"><OddsCal/></div>
</div>
<div class="tWrap">
<table class="oddstable">
    
    <thead>
      <tr>
        {#each Object.keys(output[0]) as columnHeading , i}
              
              {#if i == 0}
              <th class="py-3 px-6 text-center" in:blur> Horse</th>
              {:else}
  
              <th class="py-3 px-6 text-center" in:blur> {columnHeading}</th>
              {/if}
        {/each}
      </tr>
    </thead>
    <tbody>	{#each Object.values(output) as row ,  ii }
      <tr class="border-b border-gray-200 ">
      {#each Object.values(row) as cell,i}
              {#if i == 0}

              <th class=" relative py-3 px-6 text-left whitespace-nowrap drop-shadow-lg">
                  <div class="flex items-center">
                      <div class="mr-2" in:blur>
                          <!-- <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="600.000000pt" height="382.000000pt" viewBox="0 0 600.000000 382.000000" preserveAspectRatio="xMidYMid meet" class="logo">
                              <metadata>
                              </metadata>
                              <g transform="translate(0.000000,382.000000) scale(0.100000,-0.100000)" stroke="none" fill='#409C2C'>
                              <path  d="M2955 3536 c-37 -17 -70 -52 -84 -89 -7 -18 -11 -138 -11 -323 l0 -294 573 0 c621 0 625 -1 728 -56 114 -62 217 -203 254 -349 19 -77 19 -194 -1 -264 -18 -64 -43 -104 -51 -82 -17 44 -94 119 -157 151 l-69 35 -426 5 c-413 5 -428 6 -491 28 -182 65 -286 187 -345 407 -13 48 -14 43 -14 -110 l-1 -159 215 -216 214 -215 8 35 9 35 253 3 c209 2 252 0 248 -11 -3 -7 -28 -96 -57 -198 -28 -101 -58 -206 -65 -232 -8 -26 -11 -45 -6 -43 4 3 41 -28 81 -69 l74 -74 -105 -4 c-57 -1 14 -4 159 -5 291 -2 359 6 445 56 55 32 138 110 168 158 12 20 32 37 47 40 101 23 226 56 276 74 90 31 89 32 81 -52 -16 -175 -72 -353 -145 -465 -22 -34 -77 -96 -122 -138 -63 -60 -102 -87 -182 -125 -55 -27 -123 -54 -149 -61 -26 -6 -46 -14 -43 -16 2 -2 23 1 46 7 31 8 45 8 55 0 10 -8 22 -7 47 6 18 9 42 18 53 20 19 2 1353 742 1384 767 24 20 51 90 51 135 0 51 -19 99 -52 129 -21 20 -752 433 -765 433 -3 0 -40 -32 -82 -72 -145 -135 -333 -271 -539 -388 -97 -55 -129 -61 -71 -13 47 39 216 190 327 292 52 47 127 124 168 170 l74 84 -193 106 c-105 59 -489 273 -852 476 -363 203 -704 393 -757 423 -105 58 -156 70 -203 48z m1675 -956 c80 -80 160 -195 160 -230 0 -22 -125 -144 -139 -136 -6 4 -11 24 -11 45 0 102 -71 286 -155 399 -25 34 -45 64 -45 67 0 17 119 -73 190 -145z m495 -346 l7 -60 -125 -82 c-254 -167 -528 -277 -784 -317 -66 -10 -52 9 30 40 139 54 402 190 534 277 79 53 170 124 225 177 l93 89 7 -31 c4 -18 10 -59 13 -93z m-100 -276 c22 -86 27 -80 -123 -138 -204 -79 -458 -128 -770 -150 -189 -12 -352 -13 -352 -1 0 5 35 12 78 16 127 11 350 44 463 70 220 49 481 152 634 249 22 14 43 26 46 26 4 0 15 -32 24 -72z"/>
                              </g>
                              </svg> -->
                      </div>
                      <div class="horse">
                         
                          <span class="font-medium" in:blur>  {cell}. {horse(cell)}</span>
                          <span class="font-black text-xs	mx-4" in:blur>{jockey(cell)}</span> 
                      
                      </div>
                  </div>
              </th>
              {:else}
              <td class="py-3 px-6 text-right whitespace-nowrap cursor-pointer hover:bg-gray-300" on:click={()=> 
                                                                                                          {
                                                                                                          show =true ; 
                                                                                                          selectedBookie= Object.keys(output[0])[i];
                                                                                                          selectedOdds = cell
                                                                                                          selectedHorse = output[ii].horse_no +'. ' +horse(output[ii].horse_no)
                                                                                                          }
                                                                                                          }>
                  <div class="block items-center">
                      <span class="font-medium 	" in:blur >
                          <!-- horse  : {tableData[ii].horse_no + '. '+tableData[ii].horse} bookie : {Object.keys(output[0])[i]} -->
                           {#if $oddsCal == true}

                          {#if cell == 0 }
                             
                {cell}
                          {:else}
                       
              {(100/(cell/500)).toFixed(2)}
                          {/if}

                          {:else}

                     
              {cell}

                          {/if}    

                          <!-- 100/(950/500) -->
                      
                      </span>
                  </div>
              </td>
              {/if} 

      {/each}
    </tr>
  {/each}
</tbody>
  </table>
</div>

  {/if}


  <style>
    .caption{
     position: relative;
     height:50px;
    }




.tWrap {
  
  overflow-x:scroll;
}
.oddstable {
  /* font-size: 125%; */
  /* white-space: nowrap; */
  /* margin: 0; */
  /* border: none; */
  /* border-collapse: separate; */
  /* border-spacing: 0; */
  table-layout: fixed;
  /* border: 1px solid black; */
  min-width: 1140px;
  max-width: 1140px;
}
/* .oddstable td,
.oddstable th {
  border: 1px solid black;
  padding: 0.5rem 1rem;

} */
.oddstable thead th {
  /* padding: 3px; */
  position: sticky;
  top: 0;
  z-index: 1;
  /* width: 25vw; */
  background: white;
}
.oddstable td {
  /* background: #fff; */
  /* padding: 4px 5px; */
  /* text-align: center; */
  max-width: 20px !important;
  width: 20px !important;
  cursor: pointer;
}
/* 
.oddstable tbody td:nth-child(2){
  box-shadow: inset 4px 0 0px 2px rgba(0,0,0,0.30);
  background-color: red;
} */


.oddstable tbody th {
  /* max-height: 30px; */
  /* font-weight: 100; */
  /* font-style: italic; */
  /* text-align: left; */
  position: relative;

}
.oddstable thead th:first-child {
  position: sticky;
  left: 0;
  z-index: 2;
  -webkit-box-shadow: 10px 0px 10px rgb(57 63 72), 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
  -moz-box-shadow: 10px 0px 10px rgb(57 63 72), 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
  box-shadow: 10px 0px 10px rgb(57 63 72), 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
  border-right:black solid 1px ;
  
}
.oddstable tbody th {
  position: sticky;
  left: 0;
  background: white;
  z-index: 1;
  max-width: 100px;
  -webkit-box-shadow: 10px 0px 10px rgb(57 63 72), 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
  -moz-box-shadow: 10px 0px 10px rgb(57 63 72), 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
  box-shadow: 10px 0px 10px rgb(57 63 72), 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
  border-right:black solid 1px ;
}

.oddscal{
  position: absolute;
  right:1%;
  /* transform:translate(-50%,0%); */
} 
.racebut{
  position: absolute;
  left:50%;
  transform:translate(-50%,0%);
}


.selectList{
  position: absolute;
  appearance:none;
  padding:10px;
  border: 1px   solid rgba(65, 156, 44, 0.13);
  border-radius: 0.25rem;
  left: 1%;

}



.overlay { 
    z-index: 101;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    }
  .betCalc {
    position: absolute;
    left: 50%;
    top: 50%;
    background: white;
    width: 350px;
    height: 400px;
    border-radius: 10px;
    transform: translate(-50%,-50%);
    
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .horse {
    display: flex;
    flex-direction: column;
  }
  .horse span {
    align-self: flex-start;
  }


  .betCalc svg {
    /* left:50%; */
    /* position: relative; */
    width: 100px;
    /* transform: translate(-50%,0); */
  }
  
  .betCalc h3 {
    /* left:50%; */
    /* position: relative; */
    font-weight: bolder;
    /* transform: translate(-50%,0); */
    /* align-self: center; */
  }

  .bet {
    width: 100px;
    height: 40px;
    border-radius: 5px;
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
    padding-top: 8px;
    padding-bottom: 8px;
    padding-left: 20px;
    padding-right: 20px;
    
border: none;
    border-radius:  3px;
    margin-bottom: 3px;
    cursor: pointer;
    

}

.rounded:hover {
    background-color: rgb(255, 255, 255); 
    color: rgb(104, 104, 104);
    
  background-image: linear-gradient(rgb(255, 255, 255) 95%, rgb(104, 104, 104) 20%);

}

  </style>