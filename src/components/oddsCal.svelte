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
    font-size: 16px;
    line-height: 20px;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 24px;
    padding-right: 24px;
    
border: none;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    margin-bottom: 4px;
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
    font-size: 16px;
    line-height: 20px;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 24px;
    padding-right: 24px;
    
border: none;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    margin-bottom: 4px;
    cursor: pointer;
    

}

.rounded-l:hover ,.rounded-r:hover {
    background-color: rgb(255, 255, 255); 
    color: rgb(104, 104, 104);
    
  background-image: linear-gradient(rgb(255, 255, 255) 95%, rgb(104, 104, 104) 20%);

}
  
  </style>
  