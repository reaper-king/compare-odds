<script ang="ts" >
  import CompareOdds from "./components/CompareOdds.svelte";

</script>

<svelte:head>
  <!-- <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet"> -->
 <style>  
.caption.svelte-16ookfp.svelte-16ookfp{position:relative;height:50px}.tWrap.svelte-16ookfp.svelte-16ookfp{overflow-x:scroll}.oddstable.svelte-16ookfp.svelte-16ookfp{table-layout:fixed;min-width:1140px;max-width:1140px}.oddstable.svelte-16ookfp thead th.svelte-16ookfp{position:sticky;top:0;z-index:1;background:white}.oddstable.svelte-16ookfp td.svelte-16ookfp{max-width:20px !important;width:20px !important}.oddstable.svelte-16ookfp tbody th.svelte-16ookfp{position:relative}.oddstable.svelte-16ookfp thead th.svelte-16ookfp:first-child{position:sticky;left:0;z-index:2;-webkit-box-shadow:5px 0px 2px rgba(57, 63, 72, 0.3);-moz-box-shadow:5px 0px 2px rgba(57, 63, 72, 0.3);box-shadow:7px 0px 4px rgba(57, 63, 72, 0.3)}.oddstable.svelte-16ookfp tbody th.svelte-16ookfp{position:sticky;left:0;background:white;z-index:1;max-width:200px;-webkit-box-shadow:5px 0px 2px rgba(57, 63, 72, 0.3);-moz-box-shadow:5px 0px 2px rgba(57, 63, 72, 0.3);box-shadow:7px 0px 4px rgba(57, 63, 72, 0.3)}.oddscal.svelte-16ookfp.svelte-16ookfp{position:absolute;right:1%}.racebut.svelte-16ookfp.svelte-16ookfp{position:absolute;left:50%;transform:translate(-50%,0%)}.selectList.svelte-16ookfp.svelte-16ookfp{position:absolute;appearance:none;padding:10px;border:1px   solid #409C2C;border-radius:0.25rem;left:1%}.overlay.svelte-4euwfi{z-index:101;position:fixed;top:0;right:0;bottom:0;left:0;width:100%;height:100%;background:rgba(0, 0, 0, 0.4)}.x.svelte-4euwfi{position:absolute;right:1%;font-weight:bolder;color:floralwhite;cursor:pointer;font-size:10px;text-shadow:-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black}.placeBet.svelte-4euwfi{background-color:#409C2C}.buttonBar.svelte-4euwfi{bottom:0;right:0;left:0}.active.svelte-12qrkab{background-image:linear-gradient(#409C2C 95%, rgb(188, 247, 105) 10%)}.rounded-r.svelte-12qrkab{background-color:#409C2C;box-shadow:0 5px 5px -5px rgba(64, 155, 44,0.15), 0 10px 10px -5px rgba(64, 155, 44,0.15), 0 15px 15px -5px rgba(64, 155, 44,0.15), 0 20px 20px -5px rgba(64, 155, 44,0.15);transition-timing-function:linear;transition-duration:150ms;transition-property:all;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms;color:white;text-transform:uppercase;font-weight:700;font-size:16px;line-height:20px;padding-top:12px;padding-bottom:12px;padding-left:24px;padding-right:24px;border:none;border-top-right-radius:4px;border-bottom-right-radius:4px;margin-bottom:4px;cursor:pointer}.rounded-l.svelte-12qrkab{background-color:#409C2C;box-shadow:0 5px 5px -5px rgba(64, 155, 44,0.15), 0 10px 10px -5px rgba(64, 155, 44,0.15), 0 15px 15px -5px rgba(64, 155, 44,0.15), 0 20px 20px -5px rgba(64, 155, 44,0.15);transition-timing-function:linear;transition-duration:150ms;transition-property:all;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms;color:white;text-transform:uppercase;font-weight:700;font-size:16px;line-height:20px;padding-top:12px;padding-bottom:12px;padding-left:24px;padding-right:24px;border:none;border-top-left-radius:4px;border-bottom-left-radius:4px;margin-bottom:4px;cursor:pointer}.rounded-l.svelte-12qrkab:hover,.rounded-r.svelte-12qrkab:hover{background-color:rgb(255, 255, 255);color:rgb(104, 104, 104);background-image:linear-gradient(rgb(255, 255, 255) 95%, rgb(104, 104, 104) 20%)}.rounded-l.svelte-w7ftnj{background-color:#409C2C;box-shadow:0 5px 5px -5px rgba(64, 155, 44,0.15), 0 10px 10px -5px rgba(64, 155, 44,0.15), 0 15px 15px -5px rgba(64, 155, 44,0.15), 0 20px 20px -5px rgba(64, 155, 44,0.15);transition-timing-function:linear;transition-duration:150ms;transition-property:all;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms;color:white;text-transform:uppercase;font-weight:700;font-size:16px;line-height:20px;padding-top:12px;padding-bottom:12px;padding-left:24px;padding-right:24px;border:none;border-top-left-radius:4px;border-bottom-left-radius:4px;margin-bottom:4px;cursor:pointer}.rounded-r.svelte-w7ftnj{background-color:#409C2C;box-shadow:0 5px 5px -5px rgba(64, 155, 44,0.15), 0 10px 10px -5px rgba(64, 155, 44,0.15), 0 15px 15px -5px rgba(64, 155, 44,0.15), 0 20px 20px -5px rgba(64, 155, 44,0.15);transition-timing-function:linear;transition-duration:150ms;transition-property:all;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms;color:white;text-transform:uppercase;font-weight:700;font-size:16px;line-height:20px;padding-top:12px;padding-bottom:12px;padding-left:24px;padding-right:24px;border:none;border-top-right-radius:4px;border-bottom-right-radius:4px;margin-bottom:4px;cursor:pointer}.rounded.svelte-w7ftnj{background-color:#409C2C;box-shadow:0 5px 5px -5px rgba(64, 155, 44,0.15), 0 10px 10px -5px rgba(64, 155, 44,0.15), 0 15px 15px -5px rgba(64, 155, 44,0.15), 0 20px 20px -5px rgba(64, 155, 44,0.15);transition-timing-function:linear;transition-duration:150ms;transition-property:all;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms;color:white;text-transform:uppercase;font-weight:700;font-size:16px;line-height:20px;padding-top:12px;padding-bottom:12px;padding-left:24px;padding-right:24px;border:none;border-radius:4px;margin-bottom:4px;cursor:pointer}.roundeds.svelte-w7ftnj{background-color:#409C2C;box-shadow:0 5px 5px -5px rgba(64, 155, 44,0.15), 0 10px 10px -5px rgba(64, 155, 44,0.15), 0 15px 15px -5px rgba(64, 155, 44,0.15), 0 20px 20px -5px rgba(64, 155, 44,0.15);transition-timing-function:linear;transition-duration:150ms;transition-property:all;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms;color:white;text-transform:uppercase;font-weight:700;font-size:16px;line-height:20px;padding-top:12px;padding-bottom:12px;padding-left:24px;padding-right:24px;border:none;margin-bottom:4px;cursor:pointer}.rounded.svelte-w7ftnj:hover,.rounded-l.svelte-w7ftnj:hover,.rounded-r.svelte-w7ftnj:hover{background-color:rgb(255, 255, 255);color:rgb(104, 104, 104);background-image:linear-gradient(rgb(255, 255, 255) 95%, rgb(104, 104, 104) 20%)}.active.svelte-w7ftnj{background-image:linear-gradient(#409C2C 95%, rgb(188, 247, 105) 20%);border-color:white !important}
</style>  

</svelte:head> 

<CompareOdds></CompareOdds>



<!-- <Dropdown/> -->
<!-- 
{#if $inputs}
	 {#each $inputs as item}
	    {#if item.race_no == $race[ $race.indexOf($currentRace)]}
      <Table tableData={item.odds_compare} raceNum={item.race_no} startTime={item.start_time}></Table>	
      {/if}
	 {/each}

 {/if}
-->
 <!-- <style>
  :global(.bGroup){
      top:0%;
      /* left:50%; */
        /* transform: translate(-50%,140%); */
        /* z-index: 1; */
  }

  :global(.bGroup2){
      top:50%;
      left:89%;
        transform: translate(0%,20%);
        z-index: 1;
        max-width: 200px;
  }

  
  :global(.bGroup3){
      top:5%;
    left:11%;
        transform: translate(0%,0%);
        z-index: 1;
        max-width: 200px;
        z-index: 2;
  }


 :global(.numB) {
background-color:        #409C2C;
  }




</style>   -->