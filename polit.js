function getTasks() {
	return [].slice.call(document.getElementsByClassName('que'))
		.map(it => {
			// that's a task where you need to write an answer yourself
			if (it.getElementsByClassName('qtext').length === 0) {
				const task = {
					question: it.getElementsByClassName('formulation')[0].innerText,
					answers: Array.from(it.getElementsByClassName('subquestion'))
							.map(it => {
								if (it.childNodes[1].nodeName === 'SELECT') {
									const that = it.childNodes[1]
									return that.childNodes[that.selectedIndex].innerText
								}
								return it.childNodes[1].value
							})
				}

				if (it.getElementsByClassName('grade')[0].innerText !== 'Баллов: 1,00 из 1,00')
					task.hasMistakes = true
				
				return task
			}

			// that's common question
			const task = {
				question: it.getElementsByClassName('qtext')[0].firstChild.innerText,
				answers: []
			}

			// table
			if (it.getElementsByClassName('answer')[0].firstChild.nodeName === 'TBODY') {
				const answers = Array.from(it.getElementsByClassName('answer')[0].firstChild.childNodes)
				const feedback = it.getElementsByClassName('specificfeedback')[0]
						.firstChild.innerText

				if (feedback !== 'Ваш ответ верный.')
					task.hasMistakes = true

				for (each of answers) {
					const selection = each.lastChild.childNodes[1].childNodes[each.lastChild.childNodes[1].selectedIndex]
					task.answers.push(each.firstChild.textContent + ' - ' + selection.textContent)
				}

			// common
			} else {
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

				console.log(task)
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

function justDoAll(old) {
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
