javascript:(function(){
	function label(tasks) {
		const qtexts = document.getElementsByClassName('qtext');

		for (let it of qtexts) {
			const header = it.firstChild;

			for (let task of tasks) {
				if (task.question == header.innerText) {
					header.innerHTML += '<span style="border-radius:3px;margin-left:5px;background:#a3c8ff;padding:3px 7px;">' + task.answers.join(', ') + '</span>';
				}
			}
		}
	}

	fetch('https://raw.githubusercontent.com/lunakoly/PolitHack/master/polit.json')
	    .then(res => res.json())
	    .then(label)
	    .catch(err => console.error(err));
})()