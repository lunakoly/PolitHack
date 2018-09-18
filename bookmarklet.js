javascript:(function(){
	function label(tasks) {
		const qtexts = document.getElementsByClassName('qtext');

		for (let it of qtexts) {
			const header = it.firstChild;
			console.log('==================================');
			console.log('Testing [' + header.innerText + ']');

			for (let task of tasks) {
				console.log('For [' + task.question + ']');
				if (task.question == header.innerText) {
					console.log('Accepted');

					if (task.answers.length == 0) {
						header.innerHTML += '<span style="border-radius:3px;margin-left:5px;background:#ffa3a3;padding:3px 7px;">No info(</span>';
					} else {
						const color = task.hasMistakes ? "feffa3" : "a3c8ff";
						header.innerHTML += '<span style="border-radius:3px;margin-left:5px;background:#' + color + ';padding:3px 7px;">' + task.answers.join(', ') + '</span>';
					}
				}
			}
		}
	}

	fetch('https://raw.githubusercontent.com/lunakoly/PolitHack/master/polit.json')
	    .then(res => res.json())
	    .then(label)
	    .catch(err => console.error(err));
})()