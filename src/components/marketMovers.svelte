<script>
    import { LinkedChart, LinkedLabel, LinkedValue } from "svelte-tiny-linked-charts"

import { inputs ,currentRace  ,race} from './store';



$: console.log($inputs)
$: oddsData = $inputs[$race.indexOf($currentRace)].odds_compare.map((item,i) => {
                let container = {} ;
        
                container.bookie = item.bookmaker;
                container.horse = item.horse;
                container.odds = item.odds_obj == null ? {} : JSON.parse(item.odds_obj.replace(String.fromCharCode(92), null).replace(/[{}]/g, '').replace(/\[/g, '{').replace(/]/g, '}'))
                container.odds_count = item.odds_count == null ? 0 : item.odds_count
                
                container.newodds = item.odds;

        return container;
            
            
            }

)





$:  o = oddsData.reduce( (a,b) => {
                            a[b.bookie] = a[b.bookie] || [];
                            a[b.bookie].push({[b.horse]:b.odds , 'odds_count':b.odds_count});
                            return a;
                        }, {});

$: a = Object.keys(o).map(function(k) {
                            return {bookie : k, horse : Object.assign.apply({},o[k])};
                        });
$: console.log(oddsData)

$: oddsCounts = oddsData.map( item => {return item.odds_count}).reduce((a,b)=>a+b)

$: duration = 1*oddsCounts + 's';

</script>


    <div class="ticker-wrap">
        <div class="ticker" style="--duration :{duration}">
          
                
                {#each a as item, bk}
                {#if  item.horse["odds_count"] >=2 }
           
                    {#each Object.keys(item.horse) as horse , i}
                    <div class="ticker__item"> <strong>{item.bookie} : </strong> {horse} 
                    {#if (Object.values(item.horse[horse]).at(-1)) > (Object.values(item.horse[horse]).at(-2)) }
                         <!-- INCREASE -->
                         <span class="up">  + { ((((Object.values(item.horse[horse]).at(-1)) - (Object.values(item.horse[horse]).at(-2)))/(Object.values(item.horse[horse]).at(-2)) )*100).toFixed(2) }% </span>   

                         {:else if  (Object.values(item.horse[horse]).at(-1)) < (Object.values(item.horse[horse]).at(-2))}
                          <!-- DECREASE -->
                    <span class="down">  - { ((((Object.values(item.horse[horse]).at(-2)) - (Object.values(item.horse[horse]).at(-1)))/(Object.values(item.horse[horse]).at(-2)) )*100).toFixed(2) }% </span>   
                          {:else}
                             <span class="neutral"> 0.00%</span>
                    {/if}
                                       
                </div>
                    {/each}
                {/if}
                

                {/each}
        </div>
    </div>


<style>
    @-webkit-keyframes ticker {
  0% {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
    visibility: visible;
  }
  100% {
    -webkit-transform: translate3d(-100%, 0, 0);
    transform: translate3d(-100%, 0, 0);
  }
}
@keyframes ticker {
  0% {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
    visibility: visible;
  }
  100% {
    -webkit-transform: translate3d(-100%, 0, 0);
    transform: translate3d(-100%, 0, 0);
  }
}
.ticker-wrap {
  position: relative;
  bottom: 0;
  width: 100%;
  overflow: hidden;
  height: 64px;
  box-sizing: content-box;
}
.ticker-wrap .ticker {
  display: inline-block;
  height: 10rem;
  line-height: 4rem;
  white-space: nowrap;
  box-sizing: content-box;
  -webkit-animation-iteration-count: infinite;
  animation-iteration-count: infinite;
  -webkit-animation-timing-function: linear;
  animation-timing-function: linear;
  -webkit-animation-name: ticker;
  animation-name: ticker;
  -webkit-animation-duration:var(--duration);
  animation-duration: var(--duration);
}
.ticker-wrap .ticker__item {
  display: inline-block;
  padding: 0 2rem;
  font-size: 16px;
}
.ticker-wrap .ticker:hover {
  -webkit-animation-play-state: paused;
  -moz-animation-play-state: paused;
  -o-animation-play-state: paused;
  animation-play-state: paused;
}

.down:before {
    display: inline-block;
    left: 0;
    content: '▼';
    /* font-size: 30px; */
    color: red;
    position: relative;
    scale:1.5;
  }

  .down {
    background-color: rgba(255, 0, 0, 0.178);
    height: 50px;
    width: 110%;
    padding: 1%;
    border:1px solid rgba(255, 0, 0, 0.767);
    border-radius: 4px;
    color: rgb(141, 0, 0);
    font-weight: 900;
  }


  .up:before {
    display: inline-block;
    left: 0;
    content: '▲';
    /* font-size: 30px; */
    color: lime;
    position: relative;
    scale:1.5;
  }

  .up {
    background-color: rgba(0, 255, 0, 0.108);
    height: 50px;
    width: 110%;
    padding: 1%;
    border:1px solid  rgba(0, 255, 0, 0.767);
    height: 50px;
    border-radius: 4px;
    color: rgb(0, 141, 0);
    font-weight: 900;
  }

  .neutral {
    background-color: rgba(255, 191, 0, 0.108);
    height: 50px;
    width: 110%;
    padding: 1%;
    padding-left: 5%;
    border:1px solid  rgba(255, 191, 0, 0.767);
    border-radius: 4px;
    color: rgb(141, 108, 0);
    font-weight: 900;
  }

 



</style>