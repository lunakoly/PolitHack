function getTasks() {
	return [].slice.call(document.getElementsByClassName('que'))
		.map(it => {
			const task = {
				question: it.getElementsByClassName('qtext')[0].firstChild.innerText,
				answers: []
			}

			const isRadio = it.getElementsByClassName('answer')[0]
					.firstChild.firstChild.type === 'radio'

			const feedback = it.getElementsByClassName('specificfeedback')[0]
					.firstChild.innerText

			if (feedback !== 'Ваш ответ верный.' && !isRadio)
				task.hasMistakes = true

			if (!isRadio || feedback === 'Ваш ответ верный.') {
				const answersContainer = it.getElementsByClassName('answer')[0]

				for (let each of answersContainer.children)
					if (each.firstChild.checked)
						task.answers.push(each.innerText)
			}

			return task
		})
}

function order(task) {
	if (task.answers.length === 0)
		return 2
	if (task.hasMistakes)
		return 1
	return 0
}

function mergeTasks(tasksTo, tasksFrom) {
	for (let task of tasksFrom) {
		let found = false

		for (let it = 0; it < tasksTo.length; it++)
			if (task.question === tasksTo[it].question) {
				if (tasksTo[it].answers.length === 0 || tasksTo[it].hasMistakes) {
					if (task.hasMistakes) {	
						console.log('Manual merge required for:')
						console.log(task)
						console.log('and')
						console.log(tasksTo[it])
					} else {
						console.log('Updated: ' + task.question)
						tasksTo[it] = task
					}
				}
	
				found = true
				break
			}

		if (!found) {
			console.log('Added: ' + task.question)
			tasksTo.push(task)
		}
	}

	tasksTo.sort((a, b) => order(a) - order(b))
	return tasksTo
}

function justDoAll(oldSrc) {
	const old = JSON.parse(oldSrc)
	const merged = mergeTasks(old, getTasks())
	console.log(merged)
	return JSON.stringify(merged)
}



function testBoormarklet(src){
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
	}

	addLabels(JSON.parse(src))
}



// BEAUTIFILER:
// https://jsonlint.com/
