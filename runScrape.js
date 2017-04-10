/*--------------------------------------------------------------------/
	Author: Louis Iaeger
	Script: scrapeCards.js
	Last modified: Apr 9, 2017
	Date Created: Apr 4, 2017
	Purpose: Scrape all Yugioh card info and save to a file/MongoDB
/-------------------------------------------------------------------*/

let fs = require('fs');
let Scraper = require('./Scraper');
let Pack = require('./Mongo').Pack;
let Card = require('./Mongo').Card;

// ------------ FILES/DB -------------- //
// Where you want the data to be saved
let packSaveFile = './db/testpacksDB.json';
let cardSaveFile = './db/testcardsDB.json';

// 1) SCRAPE PACKS & CREATE ARRAY OF LINKS TO CARDS
let packs = {
	url: `https://www.db.yugioh-card.com/yugiohdb/card_list.action`,
	
	scrapePacks: function() {
		let packScraper = new Scraper(this.url);
		packScraper.on('complete', (packArr) => {
			save.savePacks(packArr);
			save.writeJSONFile(packArr, packSaveFile);
			this.filterPacks(packArr);
		});
	},
	filterPacks: function(arr) {
		let packLinksArr = [];
		arr.forEach((pack) => {
		  if (pack.category == "Special Edition Boxes" && pack.year < 2007) {  //only scrapes 4 links, quick test
				packLinksArr.push(pack.link);
				console.log(`${pack.name} --- ${pack.category} added to scrape queue.`);
		  }
		});
		cards.init(packLinksArr);
	},
	init: function() {
		this.scrapePacks();
	}
}

// 2) SCRAPE CARD DATA FROM ARRAY OF LINKS
let cards = {
	packLinks: [],
	cardsArr: [],
	numberOfParallelRequests: 3, // limits # of http requests sent at one time

	scrapeCards: function() {
		if (!this.packLinks.length) {
			save.saveCards(this.cardsArr);
			save.writeJSONFile(this.cardsArr, cardSaveFile);
			return console.log(`\nYou just scraped ${this.cardsArr.length} cards. :)`);
		}

		let url = this.packLinks.pop();
		let cardScraper = new Scraper(url);
		
		console.log('Requests Left: ' + this.packLinks.length);

		cardScraper.on('error', (err) => {
			console.log(err);
			this.scrapeCards();
		});
		cardScraper.on('complete', (groupArr) => {
			this.cardsArr.push.apply(this.cardsArr, groupArr);
			this.scrapeCards();
		});
	},
	init: function(arr) {
		this.packLinks = arr;
		for (let i = 0; i < this.numberOfParallelRequests; i++) {
			this.scrapeCards();
		}
	}
}

// 3) SAVE PACK/CARD DATA
let save = {
	savePacks: (arr) => {
		let pack = new Pack();
		save.clearCollection(pack.PackModel);
		arr.forEach((item) => {
			save.saveToDB(item, pack.PackModel);
		});
	},
	saveCards: (arr) => {
		let card = new Card();
		save.clearCollection(card.CardModel);
		arr.forEach((item) => {
			save.saveToDB(item, card.CardModel);
		});
	},
	saveToDB: (obj, model) => {
		let item_instance = new model(obj);
		item_instance.save((err) => {
			if (err) console.log(`Database save error: ${err}`);
			console.log(`Saved ${item_instance.name} to db`);
		});
	},
	// CLEAR OUT OLD COLLECTION
	clearCollection: (model) => {
		model.remove({}, (err,removed)=> {
			console.log('Cleared out the db collection.')
		});
	},
	// SAVE CARD DATA TO .JSON FILE
	writeJSONFile: ( (arr, file) => {
		fs.writeFile(file, JSON.stringify(arr), (err) => {
			if (err) throw console.log(err);
			console.log(`\n ${file} File saved.`);
		})
	})
}

packs.init();