<script>
    
  import { oddsCal } from './store'
    
</script>
<div class="bGroup2 flex relative items-center justify-center mb-4">

    <button
    class="{$oddsCal == false ? 'active' : ''} rounded-l "
    type="button"
    on:click={()=> oddsCal.set(false)}>
    f100

    </button>
    <button
    class="{$oddsCal == true ? 'active' : ''} rounded-r "
    type="button"
    on:click={()=> oddsCal.set(true)}>
    f500
    </button>
</div>


  
 <style>

  .active {
  background-image: linear-gradient(#409C2C 95%, rgb(188, 247, 105) 10%);
    }
  
    



  
.rounded-r {
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

.rounded-l {
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

.rounded-l:hover ,.rounded-r:hover {
    background-color: rgb(255, 255, 255); 
    color: rgb(104, 104, 104);
    
  background-image: linear-gradient(rgb(255, 255, 255) 95%, rgb(104, 104, 104) 20%);

}
  
  </style>
  