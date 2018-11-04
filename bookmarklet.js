javascript:(function(){
	function label(target, color, text) {
		target.innerHTML += '<span style="border-radius:3px;margin-left:5px;background:#' + color + ';padding:3px 7px;">' + text + '</span>';
	}

	function addLabels(tasks) {
		const qtexts = document.getElementsByClassName('qtext');

		for (let it of qtexts) {
			const header = it.firstChild;
			let found = false;

			for (let task of tasks) {
				if (task.question == header.innerText) {
					if (task.answers.length == 0)
						label(header, 'feffa3', 'No answers (');
					else if (task.hasMistakes)
						label(header, 'feffa3', task.answers.join(', '));
					else
						label(header, 'a3c8ff', task.answers.join(', '));
					found = true;
				}
			}

			if (!found)
				label(header, 'ffa3a3', 'No info(')
		}

		const subquestions = document.getElementsByClassName('subquestion');

		for (let it of subquestions) {
			const formulation = it.parentNode.parentNode;
			let found = false;

			for (let task of tasks) {
				if (task.question === formulation.innerText) {
					found = true;

					if (tasks.hasMistakes) {
						label(formulation, 'feffa3', task.answers.join(', '));
					} else {
						label(formulation, 'a3c8ff', task.answers.join(', '));
					}
				}
			}

			if (!found)
				label(formulation, 'ffa3a3', 'No info(');
		}
	}

	fetch('https://raw.githubusercontent.com/lunakoly/PolitHack/master/polit.json')
	    .then(res => res.json())
	    .then(addLabels)
	    .catch(err => console.error(err));
})()