const inq = require("inquirer");
const fs = require("fs");
const BasicCard = require("./BasicCard.js");
const ClozeCard = require("./ClozeCard.js");

startApp();

function startApp(){

	console.log
	(`
*************************************************
            FLASHCARD-GENERATOR APP
           -------------------------
    Create and use your very own study aide.
*************************************************
	`);


	inq.prompt([
		{
			name:"start",
			type:"list",
			message: "What would you like to do?",
			choices: ["Create new Flashcard(s)", "Study"],
		}
		])
		.then(function (answer) {
			if(answer.start === "Create new Flashcard(s)"){

				pickFCTopic("create");

			} else if(answer.start === "Study"){

				pickFCTopic("study");

			}
		});

}


// Pick Flashcard Topic

function pickFCTopic(actionType){

	console.reset();

	fs.readdir("./Topics", function(err, files){

		if (err) throw err;

		if (actionType === "create"){

			let topicsArray = ["(+) Add Topic"];

			for (var i = 0; i < files.length; i++) {
				topicsArray.push(files[i])
			}

			inq.prompt([
				{
					name:"flashcardTopic",
					type:"list",
					message: "Pick the topic for your Flashcards",
					choices: topicsArray,
				}
				])
				.then(function (answer) {

					if(answer.flashcardTopic === "(+) Add Topic"){

						addTopic();

					} else {

					pickFC(answer.flashcardTopic);

					}
				});	

		} else if (actionType === "study"){

			let topicsArray = [];

			for (var i = 0; i < files.length; i++) {
				topicsArray.push(files[i])
			}

			inq.prompt([
				{
					name:"flashcardTopic",
					type:"list",
					message: "Pick the topic you want to Study.",
					choices: topicsArray,
				}
				])
				.then(function (answer) {

					getFCType(answer.flashcardTopic);

				});	

		}

	});
}

// Show Flashcards (Study)

function getFCType(topic){

	fs.readdir("./Topics/"+topic, function(err, files){

		if (err) throw err;

		let cardTypeArray = [];

		if (files.includes("cloze.json")){
			cardTypeArray.push("Study using Cloze Cards");
		} 

		if (files.includes("basic.json")){
			cardTypeArray.push("Study using Basic Cards (Front and Back)");
		}

		inq.prompt([
			{
				name:"cardType",
				type:"list",
				message: "Choose what type of cards you want to use:",
				choices: cardTypeArray,
			}
			])
			.then(function (answer) {
				
				if(answer.cardType === "Study using Cloze Cards"){

					showCards("cloze", topic);

				} else if(answer.cardType === "Study using Basic Cards (Front and Back)"){

					showCards("basic", topic);
				}

			});


		});

}

// Show Flashcards

var count = 0;
var correct = 0;

function showCards(type, topic){


	if (type === "basic"){

		fs.readFile("./Topics/"+topic+"/basic.json", "utf8", function(error, data){

			if (error) throw error;

			var dataSplit = data.trim().split("|");

			if (count < dataSplit.length - 1){

				var parsedData = JSON.parse(dataSplit[count]);

				inq.prompt([{
					name: "flashcardQuestion",
					type: "input",
					message: parsedData.front,
				}]).then(function(answer){
					var guess = answer.flashcardQuestion;
					console.log("---------------------------------------------------"+"\nQuestion: "+parsedData.front+"\n\nYour guess: "+guess+"\n\nActual answer: "+parsedData.back+"\n---------------------------------------------------");

					if (guess.toLowerCase() === parsedData.back.toLowerCase()){
						correct++;
					}

					count++;
					showCards(type, topic);
				});
			} else {

				console.log(`
You got ${[correct]} out of ${[count]} questions right!
					`);

				count = 0;
				correct = 0;

				inq.prompt([{
					name: "nextMove",
					type: "list",
					choices: ["Keep Studying", "Exit to Main Menu"],
					message: "What would you like to do now?",
				}]).then(function(choice){
					if(choice.nextMove === "Keep Studying"){
						getFCType(topic);
					} else if (choice.nextMove === "Exit to Main Menu"){
						console.reset();
						startApp();
					}
				});
				
			}


			
		});

	} else if (type === "cloze"){

		fs.readFile("./Topics/"+topic+"/cloze.json", "utf8", function(error, data){

					if (error) throw error;

					var dataSplit = data.trim().split("|");

					if (count < dataSplit.length - 1){

						var parsedData = JSON.parse(dataSplit[count]);

						inq.prompt([{
							name: "flashcardQuestion",
							type: "input",
							message: "COMPLETE THE SENENCE: " + parsedData.partial,
						}]).then(function(answer){
							var guess = answer.flashcardQuestion.toLowerCase();
							console.log("---------------------------------------------------"+"\nPartial: "+parsedData.partial+"\n\nYour guess: "+guess+"\n\nActual answer: "+parsedData.cloze+"\n---------------------------------------------------");

							if (guess.toLowerCase() === parsedData.cloze.toLowerCase()){
								correct++;
							}

							count++;
							showCards(type, topic);
						});
					} else {

						console.log(`
		You got ${[correct]} out of ${[count]} questions right!
							`);

						count = 0;
						correct = 0;

						inq.prompt([{
							name: "nextMove",
							type: "list",
							choices: ["Keep Studying", "Exit to Main Menu"],
							message: "What would you like to do now?",
						}]).then(function(choice){
							if(choice.nextMove === "Keep Studying"){
								console.reset();
								getFCType(topic);
							} else if (choice.nextMove === "Exit to Main Menu"){
								console.reset();
								startApp();
							}
						});
						
					}


					
				});

	}

}

// Create new Topic Directory

function addTopic(){

	console.reset();

	inq.prompt([
		{
			name:"addedTopic",
			type:"input",
			message: "What Topic would you like to Add?",
		}
		])
		.then(function (answer) {

			let newTopic = "Topics/"+answer.addedTopic;

			fs.mkdir(newTopic, function(error){

				if (error) throw error;
				console.reset();
				pickFC(answer.addedTopic);
			})

		});	

}

// Pick type of Flashcard (Basic or Cloze)

function pickFC(topic){

	console.reset();

	inq.prompt([
		{
			name:"flashcardType",
			type:"list",
			message: "What kind of Flashcard would you like to create?",
			choices: ["Basic (Front and Back)", "Cloze (Partial Text Cards)", "EXIT"],
		}
		])
		.then(function (answer) {

			if(answer.flashcardType === "Basic (Front and Back)"){
				console.reset();
				createBasic(topic);
			} else if(answer.flashcardType === "Cloze (Partial Text Cards)"){
				console.reset();
				createCloze(topic);
			} else if(answer.flashcardType === "Exit to Main Menu"){
				console.reset();
				startApp();
			}

		});
}

// Create Basic Flashcard

function createBasic(topic){

	inq.prompt([
		{
			name:"basicFront",
			type:"input",
			message: "Enter the front of the card. (The Question)",
			validate: function (name){
					return name !== '';
			}
		},
		{
			name:"basicBack",
			type:"input",
			message: "Enter the back of the card. (The Answer)",
			validate: function (name){
					return name !== '';
			}
		},
		])
		.then(function (result) {
			let newBasicCard = new BasicCard(result.basicFront, result.basicBack);
			saveCard(newBasicCard, "basic", topic);
		});
}

// Create Cloze Card

function createCloze(topic){

	inq.prompt([
		{
			name:"clozeFull",
			type:"input",
			message: "Enter the full text of the Flashcard:",
			validate: function (name){
					return name !== '';
			}
		},
		{
			name:"clozeRemove",
			type:"input",
			message: "Enter the text to be removed:",
			validate: function (name){
					return name !== '';
			}
		},
		])
		.then(function (result) {

			let cFull = result.clozeFull.toLowerCase();
			let cRemove = result.clozeRemove.toLowerCase();

			if(!cFull.includes(cRemove)){

				console.log(` 
The Cloze doesn't match the original text. Please try again.
`);
				createCloze();

			} else {

			let newClozeCard = new ClozeCard(cFull, cRemove);
			saveCard(newClozeCard, "cloze", topic);

			}

		});

}

// Save Flashcards

function saveCard(card, cardType, topic){

	fs.appendFile( "Topics/"+topic+"/"+cardType + '.json', JSON.stringify(card) + '|', (err) => {
	  if (err) throw err;
	  console.log(`
The Flashcard has been saved!
`);

		inq.prompt([
			{
				name:"newCard",
				type:"confirm",
				message: "Would you like to make another card?",
				default: true,
			}
			])
			.then(function (answer) {
				if(answer.newCard === true){
					//check for cardType

					if(cardType === "basic"){
						createBasic(topic);
					}else if (cardType === "cloze"){
						createCloze(topic);
					}
				}else{
					console.reset();
					startApp();
				}
			});

	});

}

console.reset = function () {
  return process.stdout.write('\033c');
}