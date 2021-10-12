<script>
        import jsonToPivotjson from "json-to-pivot-json";
  import { race ,currentRace ,oddsCal } from './store'
	import { fade ,blur } from 'svelte/transition';

    import ButtonGroup from "./buttonGroup.svelte";
    import OddsCal from "./oddsCal.svelte";
    let output
	export let tableData = [];

    export let raceNum ;
    export let startTime ;
    // export let raceName ;

    var options = {
    row: "horse_no", 
    column: "bookmaker", 
    value: "amount"
};

 output = jsonToPivotjson(tableData, options); 
</script>

<!-- <div> class=" overflow-x-auto"> -->
    
    <div class="min-w-screen min-h-screen bg-gray-100 flex items-start justify-center bg-gray-100 font-sans overflow-hidden">
        
        <div class="relative w-full lg:w-5/6">
            <ButtonGroup></ButtonGroup> 
            <OddsCal></OddsCal>
            <div class="head">Race: {raceNum}  {startTime}</div>
            <div class="bg-white shadow-lg rounded my-6">
                <table class="min-w-max w-full table-auto"  >
	<thead>
		
        <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
			{#each Object.keys(output[0]) as columnHeading , i}
            
            {#if i == 0}
            <th class="py-3 px-6 text-center" in:blur> Horse</th>
            {:else}

            <th class="py-3 px-6 text-center" in:blur> {columnHeading}</th>
            {/if}
			{/each}
		<tr/>
	</thead>
    <tbody class="text-gray-600 text-sm font-light">
		{#each Object.values(output) as row}
			
        <tr class="border-b border-gray-200 hover:bg-gray-100">
           
				{#each Object.values(row) as cell,i}
                
                {#if i == 0}
                <th class=" relative py-3 px-6 text-left whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="mr-2" in:blur>
                            <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="600.000000pt" height="382.000000pt" viewBox="0 0 600.000000 382.000000" preserveAspectRatio="xMidYMid meet" class="logo">
                                <metadata>
                                </metadata>
                                <g transform="translate(0.000000,382.000000) scale(0.100000,-0.100000)" stroke="none" fill='#409C2C'>
                                <path  d="M2955 3536 c-37 -17 -70 -52 -84 -89 -7 -18 -11 -138 -11 -323 l0 -294 573 0 c621 0 625 -1 728 -56 114 -62 217 -203 254 -349 19 -77 19 -194 -1 -264 -18 -64 -43 -104 -51 -82 -17 44 -94 119 -157 151 l-69 35 -426 5 c-413 5 -428 6 -491 28 -182 65 -286 187 -345 407 -13 48 -14 43 -14 -110 l-1 -159 215 -216 214 -215 8 35 9 35 253 3 c209 2 252 0 248 -11 -3 -7 -28 -96 -57 -198 -28 -101 -58 -206 -65 -232 -8 -26 -11 -45 -6 -43 4 3 41 -28 81 -69 l74 -74 -105 -4 c-57 -1 14 -4 159 -5 291 -2 359 6 445 56 55 32 138 110 168 158 12 20 32 37 47 40 101 23 226 56 276 74 90 31 89 32 81 -52 -16 -175 -72 -353 -145 -465 -22 -34 -77 -96 -122 -138 -63 -60 -102 -87 -182 -125 -55 -27 -123 -54 -149 -61 -26 -6 -46 -14 -43 -16 2 -2 23 1 46 7 31 8 45 8 55 0 10 -8 22 -7 47 6 18 9 42 18 53 20 19 2 1353 742 1384 767 24 20 51 90 51 135 0 51 -19 99 -52 129 -21 20 -752 433 -765 433 -3 0 -40 -32 -82 -72 -145 -135 -333 -271 -539 -388 -97 -55 -129 -61 -71 -13 47 39 216 190 327 292 52 47 127 124 168 170 l74 84 -193 106 c-105 59 -489 273 -852 476 -363 203 -704 393 -757 423 -105 58 -156 70 -203 48z m1675 -956 c80 -80 160 -195 160 -230 0 -22 -125 -144 -139 -136 -6 4 -11 24 -11 45 0 102 -71 286 -155 399 -25 34 -45 64 -45 67 0 17 119 -73 190 -145z m495 -346 l7 -60 -125 -82 c-254 -167 -528 -277 -784 -317 -66 -10 -52 9 30 40 139 54 402 190 534 277 79 53 170 124 225 177 l93 89 7 -31 c4 -18 10 -59 13 -93z m-100 -276 c22 -86 27 -80 -123 -138 -204 -79 -458 -128 -770 -150 -189 -12 -352 -13 -352 -1 0 5 35 12 78 16 127 11 350 44 463 70 220 49 481 152 634 249 22 14 43 26 46 26 4 0 15 -32 24 -72z"/>
                                </g>
                                </svg>
                        </div>
                        <!-- <div class="flex flex-col"> -->
                            <!-- {tableData[tableData.map(function (x) { return x.horse; }).indexOf(cell)].horse_obj[0].horse_no}. -->
                            <span class="font-medium" in:blur>  {cell}</span>
                        
                        <!-- </div> -->
                    </div>
                </th>
                {:else}
                <td class="py-3 px-6 text-right whitespace-nowrap ">
                    <div class="block items-center">
                        <span class="font-medium " in:blur>
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
</div>
</div>
<style>

/* table::after {
  content: "";
  background:  url('/isd-logo.png'); 
  opacity: 0.5;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  position: absolute;
  z-index: 1;   
} */
table{
  position: relative;
  background:   url('/isd-logo (1).svg') no-repeat center center fixed;
  background-size: cover;
  z-index: 100;
}
/* 
table:before {
  content: "";
  background:   url('/isd-logo (1).svg') no-repeat center center fixed;
  background-size: 100% 120%;

    opacity: 0.1; 
  top: 6.5%;
  left: 0;
  bottom: 0;
  right: 0;
  position: relative;
  z-index: 1;   
} */

.logo {
  /* position:relative; */
  left:0;
  width: 80px;
  height: 34px;
  transition: all 0.3s;
  transform-origin: 50% 50%;
}

.head {
    position: absolute;
      top:1%;
      left:50%;
        transform: translate(-50%,50%);
        color: #636363;
        font-size: 17px;
    font-weight: 500;
}

</style>