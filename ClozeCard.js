module.exports = ClozeCard;

function ClozeCard(text, cloze){
	this.cloze = cloze;
	this.fullText = text;
	this.partial = function(){};

	if(!this.fullText.includes(this.cloze)){
		console.log("The text doesn't match the card.");
	}
}