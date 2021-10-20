<script>

	async function getRandomNumber() {
		const res = await fetch(`https://utxnaxbctngt41y-gra.adb.uk-london-1.oraclecloudapps.com/ords/gra/races/rd`);
		const text = await res.text();

		if (res.ok) {
			return JSON.parse(text).items;
		} else {
			throw new Error(text);
		}
	}
	
	let promise = getRandomNumber();

	function handleClick() {
		promise = getRandomNumber();
	}
</script>

<button on:click={handleClick}>
	generate random number
</button>

{#await promise}
	<p>...waiting</p>
{:then number}
	<p>The number is {console.log(number)}</p>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
