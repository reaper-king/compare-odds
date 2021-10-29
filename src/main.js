import App from './App.svelte';
import MarketMovers from './components/marketMovers.svelte'

const app = new App({
    target: document.querySelector('#odds-compare')
});

const mv = new MarketMovers({
    target: document.querySelector('#market-movers')
});

export { app, mv };