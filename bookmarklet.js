javascript:(function(){
	const script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = 'https://cdn.jsdelivr.net/gh/lunakoly/PolitHack@a356026c7269fe38d5735082c536bce2cb4ed1eb/hack.js';
	document.body.appendChild(script);

	script.onload = e => {
		fetch('https://raw.githubusercontent.com/lunakoly/PolitHack/debug/polit.json')
			.then(res => res.json())
			.then(tasks => PolitHack.labelAll(tasks))
			.catch(err => console.error(err));
	};
})()