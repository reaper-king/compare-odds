<script ang="ts" >
  import CompareOdds from "./components/CompareOdds.svelte";

</script>

<svelte:head>
  <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
  <style> 
.bGroup{top:0%}.bGroup2{top:50%;left:89%;transform:translate(0%,20%);z-index:1;max-width:200px}.bGroup3{top:5%;left:11%;transform:translate(0%,0%);z-index:1;max-width:200px;z-index:2}.numB{background-color:#409C2C}.caption.svelte-1naw7fa.svelte-1naw7fa{position:relative;height:50px}.tWrap.svelte-1naw7fa.svelte-1naw7fa{overflow-x:scroll}.oddstable.svelte-1naw7fa.svelte-1naw7fa{font-size:125%;white-space:nowrap;margin:0;border:none;border-collapse:separate;border-spacing:0;table-layout:fixed;border:1px solid black;min-width:1500px}.oddstable.svelte-1naw7fa td.svelte-1naw7fa,.oddstable.svelte-1naw7fa th.svelte-1naw7fa{border:1px solid black;padding:0.5rem 1rem}.oddstable.svelte-1naw7fa thead th.svelte-1naw7fa{padding:3px;position:sticky;top:0;z-index:1;width:25vw;background:white}.oddstable.svelte-1naw7fa td.svelte-1naw7fa{background:#fff;padding:4px 5px;text-align:center}.oddstable.svelte-1naw7fa tbody th.svelte-1naw7fa{max-height:30px;font-weight:100;font-style:italic;text-align:left;position:relative}.oddstable.svelte-1naw7fa thead th.svelte-1naw7fa:first-child{position:sticky;left:0;z-index:2}.oddstable.svelte-1naw7fa tbody th.svelte-1naw7fa{position:sticky;left:0;background:white;z-index:1}.oddscal.svelte-1naw7fa.svelte-1naw7fa{position:absolute;right:6%;transform:translate(-50%,0%)}.racebut.svelte-1naw7fa.svelte-1naw7fa{position:absolute;left:50%;transform:translate(-50%,0%)}.selectList.svelte-1naw7fa.svelte-1naw7fa{position:absolute;appearance:none;padding:10px;border:1px   solid #409C2C;border-radius:0.25rem;left:3%}.active.svelte-1ishgnu{background-image:linear-gradient(#409C2C 95%, rgb(188, 247, 105) 10%)}.overlay.svelte-4euwfi{z-index:101;position:fixed;top:0;right:0;bottom:0;left:0;width:100%;height:100%;background:rgba(0, 0, 0, 0.4)}.x.svelte-4euwfi{position:absolute;right:1%;font-weight:bolder;color:floralwhite;cursor:pointer;font-size:10px;text-shadow:-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black}.placeBet.svelte-4euwfi{background-color:#409C2C}.buttonBar.svelte-4euwfi{bottom:0;right:0;left:0}.active.svelte-1ishgnu{background-image:linear-gradient(#409C2C 95%, rgb(188, 247, 105) 10%)}
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
 <style>
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




</style>  