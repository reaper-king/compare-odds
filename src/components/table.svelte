<script>
    import jsonToPivotjson from "json-to-pivot-json";
    import { race ,currentRace ,oddsCal } from './store'
	import { fade ,blur ,slide} from 'svelte/transition';
    import Bet from "./betCalc.svelte";
    import ButtonGroup from "./buttonGroup.svelte";
    import OddsCal from "./oddsCal.svelte";
    // let output
	export let tableData = [];

    export let raceNum ;
    export let startTime ;
    // export let raceName ;

    var options = {
    row: "horse_no", 
    column: "bookmaker", 
    value: "amount"
};

$: output = jsonToPivotjson(tableData, options); 

// $: console.log(tableData)
 function horse(hrs_no) {

    let hrs =  tableData[tableData.map(function (x) { return x.horse_no; }).indexOf(hrs_no)].horse;
    return hrs
     
     }
     function jockey(hrs_no) {

let jock =  tableData[tableData.map(function (x) { return x.horse_no; }).indexOf(hrs_no)].jockey;

let wght =  tableData[tableData.map(function (x) { return x.horse_no; }).indexOf(hrs_no)].weight;
return jock+ " (" + wght + "kg)"
 
 }
 let show;
 let selectedHorse , selectedBookie , selectedOdds
//  $: console.log(show)
</script>
<!-- <div> class=" overflow-x-auto"> -->
    
    <div class="min-w-screen min-h-screen bg-gray-100 flex items-start justify-center bg-gray-100 font-sans overflow-hidden">
   {#if show}
   <Bet bind:show bind:horse={selectedHorse} bind:bookmaker={selectedBookie}  bind:odds={selectedOdds}></Bet>
   {/if}     
        <div class="relative w-full lg:w-5/6">
            <ButtonGroup></ButtonGroup> 
            <OddsCal></OddsCal>
            <!-- <div class="head">Race: {raceNum}  {startTime}</div> -->
            <div class="bg-white shadow-lg rounded my-6">
                <table class="min-w-max w-full table-auto"  >
                    <caption class="relative bg-gray-200 text-gray-600 head" ><span class="capleft" in:blur> Race: {raceNum}</span > &nbsp; <span class="caprght" in:blur>{startTime}</span></caption>
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
		{#each Object.values(output) as row ,  ii }
        <tr class="border-b border-gray-200 ">
				{#each Object.values(row) as cell,i}
                {#if i == 0}

                <th class=" relative py-3 px-6 text-left whitespace-nowrap drop-shadow-lg">
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
                        <div class="flex flex-col">
                           
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
  background:   url("data:image/svg+xml,%3C%3Fxml version='1.0' standalone='no'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 20010904//EN' 'http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd'%3E%3Csvg version='1.0' xmlns='http://www.w3.org/2000/svg' width='600.000000pt' height='382.000000pt' viewBox='0 0 600.000000 382.000000' preserveAspectRatio='xMidYMid meet'%3E%3Cmetadata%3E%0ACreated by potrace 1.16, written by Peter Selinger 2001-2019%0A%3C/metadata%3E%3Cg transform='translate(0.000000,382.000000) scale(0.100000,-0.100000)'%0Afill='%23409C2C' fill-opacity='0.08' stroke='none'%3E%3Cpath d='M0 1910 l0 -1910 3000 0 3000 0 0 1910 0 1910 -3000 0 -3000 0 0%0A-1910z m592 1750 c273 -84 408 -377 243 -529 -152 -140 -472 -66 -605 140 -76%0A118 -76 236 1 323 74 83 219 110 361 66z m-48 -814 c83 -41 176 -132 218 -213%0A58 -112 61 -137 59 -463 -2 -439 20 -627 96 -825 54 -142 96 -207 159 -245%0A120 -72 286 -108 418 -89 214 30 475 109 570 173 105 70 156 180 141 299 -16%0A125 -138 412 -262 618 -36 61 -63 112 -61 114 6 6 254 -162 323 -218 86 -70%0A300 -293 367 -381 183 -244 223 -381 147 -501 -66 -104 -290 -178 -619 -206%0A-156 -13 -469 -7 -670 11 -178 17 -347 65 -525 150 -256 121 -402 260 -550%0A519 -159 277 -246 638 -233 967 4 102 7 118 37 179 24 49 45 76 78 98 59 43%0A75 47 169 43 65 -2 93 -8 138 -30z m2106 8 c105 -13 275 -18 765 -23 627 -6%0A630 -6 687 -29 203 -82 337 -305 326 -542 -3 -63 -11 -99 -29 -140 l-25 -54%0A-32 46 c-43 63 -105 114 -171 140 -55 23 -61 23 -432 20 -416 -3 -463 2 -587%0A60 -135 63 -243 216 -280 396 l-17 82 -65 -6 c-421 -37 -763 -128 -885 -235%0A-81 -71 -114 -172 -95 -291 19 -124 135 -394 254 -592 36 -59 66 -112 66 -117%0A0 -12 -241 150 -335 226 -77 61 -287 280 -359 374 -63 81 -145 215 -162 264%0A-8 22 -14 71 -14 109 0 111 40 168 153 222 102 48 284 90 472 110 95 10 636%0A-4 765 -20z m2656 -11 c-3 -21 -16 -107 -28 -190 -13 -84 -26 -153 -31 -153%0A-4 0 -19 12 -32 28 l-24 27 -16 -23 c-97 -136 -299 -315 -515 -457 -128 -84%0A-290 -178 -296 -172 -2 2 60 59 138 128 301 263 480 460 539 594 l21 47 -48%0A49 c-26 27 -45 51 -42 55 8 7 307 102 327 103 10 1 12 -8 7 -36z m-654 -282%0Ac58 -64 138 -185 138 -209 0 -7 -30 -42 -67 -79 -72 -71 -81 -70 -82 3 -1 45%0A-47 196 -77 257 -15 29 -45 79 -68 112 -23 33 -46 66 -51 74 -20 34 152 -98%0A207 -158z m469 -296 c7 -47 10 -87 8 -89 -2 -2 -56 -39 -119 -81 -210 -140%0A-483 -257 -700 -300 -47 -9 -93 -19 -102 -21 -10 -3 -18 -1 -18 3 0 5 37 24%0A83 43 146 59 394 190 519 273 69 46 161 119 212 169 50 48 94 87 97 88 4 0 13%0A-38 20 -85z m-1321 -199 c0 -8 -36 -140 -79 -293 -44 -153 -83 -290 -86 -305%0Al-7 -28 280 0 c252 0 286 2 345 20 84 26 175 93 230 169 l42 59 95 22 c52 12%0A137 36 188 52 52 16 96 28 98 25 2 -2 0 -48 -6 -102 -40 -353 -215 -607 -496%0A-719 -178 -71 -155 -69 -831 -73 l-612 -4 9 28 c5 15 82 276 170 578 88 303%0A163 558 166 568 5 16 26 17 250 17 204 0 244 -2 244 -14z m1224 -101 c9 -35%0A16 -68 16 -73 0 -14 -144 -76 -255 -111 -205 -63 -426 -97 -737 -111 -257 -12%0A-268 -12 -268 0 0 6 19 10 43 10 72 0 284 29 439 60 250 50 523 152 678 254%0A30 19 58 36 61 36 4 0 14 -29 23 -65z m-1944 -1251 l0 -44 -85 0 -85 0 0 -230%0A0 -230 -50 0 -50 0 0 230 0 230 -85 0 -85 0 0 45 0 44 108 3 c59 2 158 2 220%0A0 l112 -3 0 -45z m-2680 -229 l0 -275 -50 0 -50 0 0 275 0 275 50 0 50 0 0%0A-275z m426 260 c27 -8 58 -20 68 -28 18 -13 18 -15 -3 -55 -12 -23 -23 -42%0A-25 -42 -2 0 -23 9 -47 19 -95 41 -180 33 -187 -18 -6 -36 24 -58 124 -91 123%0A-41 154 -73 154 -160 0 -52 -4 -64 -30 -94 -45 -50 -103 -70 -192 -64 -72 5%0A-136 28 -187 67 l-23 18 21 41 c12 23 24 42 26 42 3 0 23 -12 44 -26 104 -68%0A231 -62 231 11 0 33 -28 52 -125 85 -100 34 -140 65 -156 122 -19 74 15 139%0A91 172 45 20 152 20 216 1z m533 -15 c145 -81 107 -314 -57 -349 -29 -6 -84%0A-11 -122 -11 l-70 0 0 -80 0 -80 -50 0 -50 0 0 276 0 276 153 -4 c140 -3 155%0A-5 196 -28z m559 -5 c91 -50 142 -135 142 -239 0 -108 -48 -190 -141 -241 -49%0A-27 -62 -30 -149 -30 -78 0 -102 4 -135 22 -62 32 -121 103 -139 164 -33 109%0A-10 198 68 275 68 66 118 84 221 81 66 -3 90 -8 133 -32z m548 20 c84 -25 124%0A-82 124 -177 0 -64 -31 -132 -71 -155 -16 -10 -29 -20 -29 -23 0 -4 25 -42 55%0A-85 30 -44 55 -83 55 -88 0 -4 -26 -7 -57 -5 l-57 3 -46 77 -45 78 -72 0 -73%0A0 0 -80 0 -80 -50 0 -50 0 0 275 0 275 133 0 c89 0 150 -5 183 -15z m1006 -1%0Ac25 -8 65 -31 88 -51 119 -102 122 -309 6 -411 -65 -57 -96 -65 -263 -70%0Al-153 -4 0 276 0 276 138 0 c99 0 151 -4 184 -16z m641 -252 c64 -148 117%0A-272 117 -275 0 -4 -24 -7 -53 -7 l-54 0 -24 60 -24 61 -133 -3 -134 -3 -23%0A-55 -23 -55 -52 -3 c-47 -3 -52 -1 -48 15 3 10 56 134 119 276 l114 257 50 0%0A51 0 117 -268z m507 223 l0 -45 -85 0 -85 0 0 -230 0 -230 -50 0 -50 0 0 230%0A0 230 -85 0 -85 0 0 45 0 45 220 0 220 0 0 -45z m396 -220 c62 -143 114 -266%0A114 -272 0 -9 -17 -13 -50 -13 l-51 0 -26 60 -26 60 -132 0 -132 0 -24 -60%0A-24 -60 -52 0 c-29 0 -53 2 -53 5 0 5 228 524 236 537 3 5 28 8 56 6 l51 -3%0A113 -260z'/%3E%3Cpath d='M1110 565 l0 -105 53 0 c126 1 187 35 187 103 0 71 -57 107 -170 107%0Al-70 0 0 -105z'/%3E%3Cpath d='M1692 649 c-140 -70 -140 -260 1 -328 98 -48 208 -4 252 101 20 49%0A19 84 -4 133 -22 48 -54 79 -103 100 -51 21 -95 19 -146 -6z'/%3E%3Cpath d='M2250 564 l0 -107 83 5 c45 3 94 11 108 18 50 23 68 94 36 144 -21%0A31 -71 46 -159 46 l-68 0 0 -106z'/%3E%3Cpath d='M3250 486 l0 -186 73 0 c77 1 136 17 169 47 65 59 77 178 24 247 -40%0A53 -78 69 -178 74 l-88 4 0 -186z'/%3E%3Cpath d='M3937 623 c-7 -11 -87 -195 -87 -200 0 -2 41 -3 90 -3 50 0 90 4 90%0A8 0 8 -79 194 -85 200 -2 2 -5 -1 -8 -5z'/%3E%3Cpath d='M4798 529 l-46 -109 94 0 93 0 -45 107 c-24 59 -45 108 -47 109 -1 1%0A-23 -47 -49 -107z'/%3E%3C/g%3E%3C/svg%3E%0A") no-repeat center center fixed;
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
        color: #636363;
        font-size: 17px;
    font-weight: 500;
}
.caprght{
    position: absolute;
    left:10%;
}

.capleft{
    position: absolute;
    left:2%;
}
</style>