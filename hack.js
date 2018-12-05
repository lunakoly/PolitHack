const PolitHack = (function() {
	const COLOR = {
		HAS_MISTAKES: 'feffa3',
		CORRECT: 'a3c8ff',
		SERIES: '9bf7bc',
		WRONG: 'ffa3a3'
	};

	function bubble(text, color = COLOR.CORRECT) {
		return `<span style="border-radius:3px;margin-right:5px;background:#${color};padding:3px 7px;line-height:2em;">${text}</span>`;
	}

	function labelHasMistakes(target, text) {
		target.innerHTML += bubble(text, COLOR.HAS_MISTAKES);
	}

	function labelCorrect(target, text) {
		target.innerHTML += bubble(text, COLOR.CORRECT);
	}

	function labelSeries(target, text) {
		target.innerHTML += bubble(text, COLOR.SERIES);
	}

	function labelWrong(target, text) {
		target.innerHTML += bubble(text, COLOR.WRONG);
	}

	function labelVariant(target, n) {
		target.innerHTML += `<p>Вариант ${n}</p>`
	}

	const QUESTION_MASK = /[^а-яА-ЯёЁ0-9a-zA-Z]/g;

	function areEqualQuestions(question1, question2) {
		return question2.replace(QUESTION_MASK, '').toLowerCase()
				.startsWith(question1.replace(QUESTION_MASK, '').toLowerCase())
	}

	function getTaskBlocks() {
		return document.getElementsByClassName('que');
	}

	function textOf(element) {
		let text = '';

		for (let each of element.childNodes) {
			if (each.nodeName === '#text')
				text += each.textContent.trim();

	        if (
	        	each.tagName === 'P' ||
	        	each.tagName === 'A' ||
	        	each.tagName === 'EM' ||
	        	each.tagName === 'STRONG'
	        ) text += textOf(each);

			if (each.tagName === 'DIV' && !each.classList.contains('ablock'))
				text += textOf(each);
		}

		return text + ' ';
	}

	function shorten(text) {
		return text.replace(/\s+/g, ' ').trim();
	}

	function formulationOf(taskBlock) {
		return shorten(textOf(taskBlock.querySelector('.formulation')));
	}

	function headerOf(taskBlock) {
		return taskBlock.querySelector('.qtext') || taskBlock.querySelector('.formulation');
	}

	function isAnswerAvailable(task) {
		return task.answer.length !== 0
	}

	function labelAll(tasks) {
		for (let each of getTaskBlocks()) {
			const question = formulationOf(each);
			const header = headerOf(each);
			let found = false;

			for (let task of tasks) {
				if (areEqualQuestions(task.question, question)) {
					if (isAnswerAvailable(task)) {
						for (let item of task.answer)
							labelCorrect(header, item);

					} else {
						for (let n = 1; n <= task.variants.length; n++) {
							const answers = task.variants[n - 1];

							if (answers.length > 0) {
								const correctness = answers[answers.length - 1];
								let correctCount = '';

								if (correctness.startsWith('Верных')) {
									correctCount = ' (' + correctness + ')';
									answers.pop();
								}

								labelVariant(header, n + correctCount);
								for (let item of task.variants[n - 1])
									labelHasMistakes(header, item);
							}
						}
					}

					found = true;
					break;
				}
			}

			if (!found) {
				labelWrong(header, 'No info (');
			}
		}
	}

	return {
		labelAll: labelAll
	};
})();