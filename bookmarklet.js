javascript:(function(){
	fetch('https://raw.githubusercontent.com/lunakoly/PolitHack/debug/hack.js')
		.then(res => res.text())
		.then(it => {
			const script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = it;
			document.body.appendChild(script);
			
			fetch('https://raw.githubusercontent.com/lunakoly/PolitHack/debug/polit.json')
			    .then(res => res.json())
			    .then(tasks => PolitHack.labelAll(tasks))
			    .catch(err => console.error(err));
		})
		.catch(err => console.err(err));
})()