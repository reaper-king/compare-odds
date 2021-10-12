<script>
    
  import { oddsCal } from './store'
    
</script>
<div class="bGroup2 flex relative items-center justify-center mb-4">

    <button
    class="{$oddsCal == false ? 'active' : ''} numB text-white hover:bg-green-300 hover:text-green-900 focus:bg-green-300 focus:text-green-900 font-bold uppercase text-xs px-4 py-2 outline-none focus:outline-none mb-1 ease-linear rounded-l transition-all duration-150"
    type="button"
    on:click={()=> oddsCal.set(false)}>
    f100

    </button>
    <button
    class="{$oddsCal == true ? 'active' : ''} numB text-white hover:bg-green-300 hover:text-green-900 focus:bg-green-300 focus:text-green-900 font-bold uppercase text-xs px-4 py-2 outline-none focus:outline-none mb-1 ease-linear rounded-r transition-all duration-150"
    type="button"
    on:click={()=> oddsCal.set(true)}>
    f500
    </button>
</div>


  
 <style>

  .active {
  background-image: linear-gradient(#409C2C 90%, rgb(188, 247, 105) 10%);
    }
  
    
  
  
  </style>
  