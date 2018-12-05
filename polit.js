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

	const TASK_BLOCK_TYPE = {
		DROPDOWN: 'Dropdown Task Block',
		TYPEIN: 'Typein Task Block',
		LIST: 'List Task Block',
		AB: 'AB Task Block'
	};

	function getTaskBlockType(taskBlock) {
		const qtext = taskBlock.querySelector('.qtext');

		if (!qtext)
			return TASK_BLOCK_TYPE.TYPEIN;

		if (qtext.querySelector('UL'))
			return TASK_BLOCK_TYPE.AB;

		const answer = taskBlock.querySelector('.answer');

		if (answer.firstElementChild.tagName === 'TBODY')
			return TASK_BLOCK_TYPE.DROPDOWN;

		const firstRow = answer.firstElementChild;

		if (firstRow.firstElementChild.tagName === 'INPUT')
			if (firstRow.firstElementChild.type === 'checkbox' ||
				firstRow.firstElementChild.type === 'radio')
				return TASK_BLOCK_TYPE.LIST;

		return null;
	}

	function isCorrect(taskBlock) {
		return taskBlock.querySelector('.grade').textContent === 'Баллов: 1,00 из 1,00';
	}

	function getTasks() {
		const tasks = [];

		for (let it of getTaskBlocks()) {
			const task = {
				question: formulationOf(it)
			};

			const type = getTaskBlockType(it);
			const answer = [];

			if (type === TASK_BLOCK_TYPE.LIST) {
				const rows = it.querySelector('.answer').children;

				for (let each of rows)
					if (each.firstElementChild.checked)
						answer.push(shorten(each.innerText));

			} else if (type === TASK_BLOCK_TYPE.DROPDOWN) {
				const tbody = it.querySelector('.answer').firstElementChild;
				const rows = tbody.children;

				for (let each of rows){
					const text = each.querySelector('.text').innerText;
					const select = each.querySelector('.select');
					const value = select.children[select.selectedIndex].innerText;
					answer.push(shorten(text + ' - ' + value));
				}

			} else if (type === TASK_BLOCK_TYPE.TYPEIN) {
				const subquestions = it.getElementsByClassName('subquestion');

				for (let sub of subquestions) {
					const input = sub.children[1];

					if (input.tagName === 'SELECT')
						answer.push(shorten(input.children[input.selectedIndex].innerText));
					else
						answer.push(shorten(input.value));
				}

			} else if (type === TASK_BLOCK_TYPE.AB) {
				const rows = it.querySelector('.answer').children;
				const qtext = it.querySelector('.qtext');
				const ul = qtext.querySelector('ul');

				const A = shorten(ul.children[0].textContent);
				const B = shorten(ul.children[1].textContent);

				for (let each of rows) {
					const rowContents = each.children;

					if (rowContents[0].checked) {
						switch (rowContents[1].textContent) {
							case 'верно только А':
								answer.push(A);
							break;

							case 'верно только Б':
								answer.push(B);
							break;

							case 'верны оба суждения':
								answer.push('верны оба суждения');
							break;

							default:
								answer.push('оба суждения неверны');
						}

						break;
					}
				}

			} else {
				console.log('Unknown type:');
				console.log(it);
			}

			if (isCorrect(it)) {
				task.variants = [];
				task.answer = answer;
			} else {
				task.answer = [];
				task.variants = [answer];

				const correctness = it.querySelector('.numpartscorrect');

				if (correctness) {
					const correctCount = correctness.innerText.split(/\s+/).pop();
					const number = parseInt(correctCount) || -1;

					if (number !== -1)
						answer.push('Верных ' + number);
				}
			}

			tasks.push(task);
		};

		return tasks;
	}

	function mergeTasks(tasksFrom, tasksTo) {
		for (let it of tasksFrom) {
			let found = false;

			for (let that of tasksTo) {
				if (areEqualQuestions(it.question, that.question)) {

					if (that.variants.length !== 0) {
						console.log('Updated: ' + it.question)

						if (it.variants.length === 0) {
							that.answer = it.answer
							that.variants = []
						} else {
							it.variants.forEach(variant => that.variants.push(variant))
						}
					}

					found = true;
					break;
				}
			}

			if (!found) {
				console.log('Added: ' + it.question);
				tasksTo.push(it);
			}
		}

		tasksTo.sort((a, b) => a.variants.length - b.variants.length);
		return tasksTo;
	}

	function justDoAll(old) {
		const merged = mergeTasks(getTasks(), old);
		console.log(JSON.stringify(merged));
		return merged;
	}

	function validateBase(tasks) {
		for (let task of tasks) {
			task.question = shorten(task.question);

			for (let it = 0; it < task.answer.length; it++)
				task.answer[it] = shorten(task.answer[it]);

			for (let it = 0; it < task.variants.length; it++)
				for (let that = 0; that < task.variants[it].length; that++)
					task.variants[it][that] = shorten(task.variants[it][that]);
		}

		tasks.sort((a, b) => a.variants.length - b.variants.length);
		return JSON.stringify(tasks);
	}

	const Debug = {
		label(target) {
			labelCorrect(target, 'Correct');
			labelSeries(target, 'Series');
			labelHasMistakes(target, 'Has mistakes / No answers (');
			labelWrong(target, 'No info (');
		},

		types() {
			for (let it of getTaskBlocks()) {
				const type = getTaskBlockType(it);
				labelSeries(it, type);
			};
		},

		self() {
			const merged = justDoAll([])
			labelAll(merged)
		},

		auto(tasks) {
			const merged = justDoAll(tasks)
			labelAll(merged)
		},

		formulateAll() {
			for (let it of getTaskBlocks()) {
				const formulation = formulationOf(it);
				const betterFormulation = formulation.replace(/\s+/g, ' ').trim();
				it.innerHTML += '<p>Old Formulation:</p>'
				labelCorrect(it, formulation);
				it.innerHTML += '<p>New Formulation:</p>'
				labelSeries(it, betterFormulation);
			}
		}
	}

	return {
		isAnswerAvailable: isAnswerAvailable,
		areEqualQuestions: areEqualQuestions,
		labelHasMistakes: labelHasMistakes,
		getTaskBlocks: getTaskBlocks,
		formulationOf: formulationOf,
		labelVariant: labelVariant,
		labelCorrect: labelCorrect,
		labelSeries: labelSeries,
		labelWrong: labelWrong,
		headerOf: headerOf,
		labelAll: labelAll,
		bubble: bubble,

		getTaskBlockType: getTaskBlockType,
		mergeTasks: mergeTasks,
		justDoAll: justDoAll,
		isCorrect: isCorrect,
		getTasks: getTasks,

		validateBase: validateBase,

		Debug: Debug
	};
})();