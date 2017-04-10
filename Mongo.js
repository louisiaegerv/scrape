// ---------------- //
// --- DB SETUP --- //
// ---------------- //
let mongoose = require('mongoose');
let dbName = 'yugioh';
mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://localhost/${dbName}`);

const db = mongoose.connection;
db.on('connected', () => {
	console.log(`connected to ${dbName} db`);
})
	.on('error', (err) => {
	console.log(`Mongoose connection error: ${err}`);
});

// ------------------ //
// --- DATA STUFF --- //
// ------------------ //

let Pack = function (){
	this.packSchema = new mongoose.Schema({
		name : String,
		link : String,
		year : Number,
		category : String
	});
	this.PackModel = mongoose.model('Pack', this.packSchema);
}
let Card = function () {
	this.cardSchema = new mongoose.Schema({
		name : String,
		attack : Number,
		defense : Number,
		level : Number,
		attribute : String,
		type : String,
		effect : String,
		text : String,
		link : String,
		groupName : String
	});
	this.CardModel = mongoose.model('Card', this.cardSchema);
}

/*
let testcards = [
	{	
		"name": "Five-Headed Dragon",
		"attack": "5000",
		"defense": "5000",
		"level": "12",
		"attribute": "DARK",
		"type": "[Dragon/Fusion/Effect]",
		"effect": "",
		"text": "5 Dragon-Type monstersMust be Fusion Summoned, and cannot be Special Summoned by other ways. Cannot be destroyed by battle with a DARK, EARTH, WATER, FIRE, or WIND monster.",
		"link": "https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=5502",
		"groupName": "STRUCTURE DECK DINOSAUR'S RAGE SPECIAL EDITION"
	}, 
	{
		"name": "Invader of Darkness",
		"attack": "2900",
		"defense": "2500",
		"level": "8",
		"attribute": "DARK",
		"type": "[Fiend/Effect]",
		"effect": "",
		"text": "Your opponent cannot activate Quick-Play Spell Cards.",
		"link": "https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=5922",
		"groupName": "THE LOST MILLENNIUM SPECIAL EDITION"
	}, 
	{
		"name": "Chaos Emperor Dragon - Envoy of the End",
		"attack": "3000",
		"defense": "2500",
		"level": "8",
		"attribute": "DARK",
		"type": "[Dragon/Effect]",
		"effect": "",
		"text": "This card cannot be Normal Summoned or Set. This card can only be Special Summoned by removing from play 1 LIGHT and 1 DARK monster in your Graveyard. You can pay 1000 Life Points to send all cards in both players' hands and on the field to the Graveyard. Inflict 300 damage to your opponent for each card sent to the Graveyard by this effect.",
		"link": "https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=5860",
		"groupName": "THE LOST MILLENNIUM SPECIAL EDITION"
	}
];

let card = new Card();
clearCollection(card.CardModel);

testcards.forEach((item) => {
	saveToDB(item, card.CardModel);
});
*/

// QUERYING DATA
/*Card.find({ attack: '3000' }, 'name attack', (err, cards) => {
	if (err) return console.log(err);
	console.log(cards);
}).limit(4)
	.sort({ name: 1 });
*/

module.exports.Pack = Pack;
module.exports.Card = Card;
