<script>
    export let show = false;
    export let horse ;
    export let bookmaker;
    export let odds;
    import { fly ,blur } from "svelte/transition";
    let bet = 0 ;
    $: payout = (bet * odds) / 100; 
    
</script>

<div class="overlay flex align-center justify-center" transition:fly>
{#if odds == 0 }

<div class=" h-1/3 w-2/6 my-20  flex flex-col items-center align-center justify-center inline-block  bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all">
        <svg version="1.1" class=" h-1/5 w-1/5 -mt-0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
<path style="fill:#47CEAC;" d="M512,256.006C512,397.402,397.394,512.004,256.004,512C114.606,512.004,0,397.402,0,256.006
C-0.007,114.61,114.606,0,256.004,0C397.394,0,512,114.614,512,256.006z"/>
<path style="fill:#36BB9A;" d="M511.712,267.373c-0.119-0.137-0.238-0.274-0.368-0.402
c-0.223-0.221-132.713-132.715-132.993-132.992c-0.222-0.22-0.47-0.403-0.693-0.621c-0.281-0.282-0.518-0.594-0.801-0.874
c-32.27-31.934-75.417-49.161-120.981-48.268c-46.031,0.791-89.349,19.387-121.969,52.361
c-32.838,33.193-50.485,76.668-49.694,122.415c0.799,46.023,18.887,88.827,50.934,120.528c0.226,0.223,0.477,0.41,0.703,0.631
c0.276,0.277,0.512,0.587,0.791,0.863c0.226,0.223,130.481,130.414,130.707,130.636c0.02,0.02,0.037,0.043,0.058,0.063
C399.729,505.913,505.926,399.705,511.712,267.373z"/>
<g>
<polygon style="fill:#F4F6F9;" points="427.788,253.013 427.788,253.017 427.788,253.017 	"/>
<path style="fill:#F4F6F9;" d="M255.876,84.217c-46.032,0.791-89.349,19.387-121.969,52.361
   c-32.838,33.193-50.485,76.668-49.694,122.415c0.799,46.025,18.886,88.828,50.934,120.529
   c31.558,31.216,73.338,48.297,117.947,48.297c1.01,0,2.028-0.007,3.042-0.026c46.032-0.799,89.346-19.397,121.963-52.371
   c32.842-33.191,50.484-76.661,49.691-122.404c-0.799-46.028-18.883-88.831-50.93-120.532
   C344.588,100.55,301.441,83.323,255.876,84.217z M412.847,253.276c0.73,41.68-15.386,81.329-45.367,111.639
   c-29.862,30.179-69.497,47.206-111.606,47.936c-41.633,0.828-80.833-14.885-110.218-43.953
   c-29.261-28.94-45.773-68.066-46.502-110.166c-0.725-41.687,15.389-81.34,45.375-111.65
   c29.862-30.179,69.497-47.202,111.606-47.924c0.933-0.018,1.868-0.026,2.798-0.026c40.641,0,78.691,15.553,107.42,43.971
   c29.253,28.943,45.765,68.07,46.495,110.17C412.847,253.276,412.847,253.276,412.847,253.276z"/>
<path style="fill:#F4F6F9;" d="M256,285.885c4.126,0,7.47-3.345,7.47-7.47V158.892c0-4.126-3.345-7.47-7.47-7.47
   c-4.126,0-7.47,3.345-7.47,7.47v119.522C248.53,282.54,251.874,285.885,256,285.885z"/>
<path style="fill:#F4F6F9;" d="M256.007,315.765h-0.27c-8.241,0-14.821,6.954-14.675,15.195c0.139,8.17,6.798,14.686,14.93,14.686
   h0.27c8.241,0,14.821-6.954,14.675-15.195C270.791,322.281,264.14,315.765,256.007,315.765z"/>
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
<p class="p-8	text-lg text-gray-500">
    Sorry! Selected Bookmaker: <strong>{bookmaker}'s</strong> Odds for horse <strong>{horse}</strong>, is not enough. Please try again selecting different odds.
  </p>     
    <div class="buttonBar relative  px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ">
        <button type="button" class="w-1/5 placeBet w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-200 sm:ml-3 sm:w-auto sm:text-sm"
        on:click={()=>show = false } >
        Ok
      </button>
    </div>
    
</div>
{:else}

  <div class="h-3/5 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
    <div class="x" on:click={()=>show = false }><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="#409C2C" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={10} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg></div>
    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
      <div class="sm:flex sm:items-start">
        <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
          <!-- Heroicon name: outline/exclamation -->
          <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
          viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
     <g>
         <circle style="fill:none;" cx="256" cy="256" r="256"/>
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
        </div>
        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
            Betting Calculator
          </h3>
          <div class="mb-6">
            <!-- <p class="text-sm text-gray-500">
              Are you sure you want to deactivate your account? All of your data will be permanently removed. This action cannot be undone.
            </p> -->
            <p class="text-xl text-gray-900">{horse}</p>
            <p class="text-xl text-gray-900">{bookmaker}</p>
            <p class="text-xl text-gray-900">{odds}</p>
            <div class="mb-6">
                <label for="betAmount" class="text-sm font-medium text-gray-900 block mb-2">Bet</label>
                <input bind:value={bet} type="number" id="betAmount" class="bg-gray-50 appearance-none border border-green-300 text-gray-900 sm:text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5" >
            </div>
            {#if payout != 0 }
            <p class="text-xl text-gray-900" transition:fly>Payout:<br> <span in:blur>{payout}</span></p>
            {/if}
          </div>
        </div>
      </div>
    </div>
    <div class="buttonBar absolute bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ">
      <button id="placeBet" type="button" class=" placeBet w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-200 sm:ml-3 sm:w-auto sm:text-sm">
        Place Bet
      </button>
      <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
      on:click={()=>show = false } >
        Cancel
      </button>
    </div>
  </div>
  
{/if}
</div>
<style>
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
    .x {
        position: absolute;
        right: 1%;
        font-weight: bolder;
        color: floralwhite;
        cursor: pointer;
        font-size: 10px;
        
    text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
    }
    .placeBet {
        background-color: #409C2C;
}
.buttonBar {
    bottom: 0;
    right: 0;
    left: 0;
}
</style>