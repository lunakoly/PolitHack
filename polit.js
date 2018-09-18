function getQuestions() {
	const qtexts = document.getElementsByClassName('qtext')
	const base = []

	for (let it of qtexts) {
		base.push({
			question: it.firstChild.innerText,
			answers: []
		})
	}

	return JSON.stringify(base)
}

function label(answers) {
	const qtexts = document.getElementsByClassName('qtext')
	const data = JSON.parse(answers)

	for (let it of qtexts) {
		const header = it.firstChild

		for (let task of data) {
			if (task.question == header.innerText) {
				header.innerHTML += '<span style="border-radius:3px;margin-left:5px;background:#a3c8ff;padding:3px 7px;">' + task.answers.join(', ') + '</span>'
			}
		}
	}
}
