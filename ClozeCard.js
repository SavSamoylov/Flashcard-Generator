module.exports = ClozeCard;

function ClozeCard(text, cloze){

		this.cloze = cloze;
		this.fullText = text;
		this.partial = replaceCloze(this.fullText, this.cloze);

		function replaceCloze(text, cloze){

			return text.replace(cloze, "...")
		}

}