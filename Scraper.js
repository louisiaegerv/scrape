/*--------------------------------------------------------------------/
	Author: Louis Iaeger
	Script: scraper.js
	Last modified: Apr 7, 2017
	Date Created: Apr 4, 2017
	Purpose: Scrape latest card pack data (for packs, decks, tins, etc.)
					 from Yugioh DB site and return array of pack objects
/-------------------------------------------------------------------*/
let cheerio = require('cheerio');
let https = require('https');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

//*** Set up constructors ***
let Scraper = function (url) {
  this.url = url;
  this.init();
}

util.inherits(Scraper, EventEmitter);

// *** Initialize scraping ***
Scraper.prototype.init = function () {
  let self = this;
	
	//Waits for the 'loaded' emit event to fire
  self.on('loaded', function(html) {
    let groupArr = self.parseCardPages(html);
		if (this.url == 'https://www.db.yugioh-card.com/yugiohdb/card_list.action') {
			groupArr = self.parsePacksPage(html);
		};
    self.emit('complete', groupArr);
  });
	self.loadWebPage();
}

Scraper.prototype.loadWebPage = function () {
  let self = this;
  console.log('\n\nLoading website: ' + self.url);
  https.get(self.url, (res) => {
    let body = '';
    if(res.statusCode !== 200) {
      return self.emit('error', res.statusCode);
    }
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      self.emit('loaded', body);
    });
  })
  .on('error', (err) => {
    self.emit('error', err);
  });
};

Scraper.prototype.parsePacksPage = function (html) {

	let $ = cheerio.load(html);
  let BASE_URL = `https://www.db.yugioh-card.com/yugiohdb/`;
  let packsArray = [];
	let numPacks = 0;
  let frame = $('#card_list_1').html();

	$('.list_body', frame).each((i, column) => {

		let category = $(column).prev().find('.pack_l th')[1];
		category = $(category).text();
		let validCategory = (category != 'Duel Terminal Cards') && (category != 'Others');
//		let validCategory = (category == 'Special Edition Boxes');

		if(validCategory) {
			$('.pack_m', column).each((j, year) => {
				let itemYear = $(year).text().slice(2);
				let toggleGroup = year.next.next;
				toggleGroup = $(toggleGroup).html();

				$('.pack', toggleGroup).each((k, pack) => {
					let packObj = {};
					packObj.name = $(pack).text().trim();
					packObj.link = BASE_URL +  $(pack).find('.link_value').val();
					packObj.year = Number(itemYear);
					packObj.category = category;

					packsArray[numPacks] = packObj;
					numPacks++;
				});
			});
		}
	});
  return packsArray;
};

Scraper.prototype.parseCardPages = function (html) {
  let $ = cheerio.load(html);
  let BASE_URL = `https://www.db.yugioh-card.com/yugiohdb/`;
  let cardsArray = [];
	let numCards = 0;
  let groupName = $('#broad_title h1').text();

  $('li', '.box_list').each((j, cardElement) => {
    let card = {};
    card.name = $(cardElement).find('.card_status').text().trim();
  	card.attack = Number($(cardElement).find('.atk_power').text().trim().substring(4)) || 0;
  	card.defense = Number($(cardElement).find('.def_power').text().trim().substring(4)) || 0;
  	card.level = Number($(cardElement).find('.level').text().trim().substring(6)) || 0;
  	card.attribute = $(cardElement).find('.box_card_attribute').text().trim() || "";
  	card.type = $(cardElement).find('.card_info_species_and_other_item').text().trim() || "";
  	card.effect = $(cardElement).find('.box_card_effect').text().trim() || "";
  	card.text = $(cardElement).find('.box_card_text').text().trim();
  	card.link = BASE_URL + $(cardElement).find('.link_value').val();
    card.groupName = groupName;
//		if (card != null) {
		cardsArray[numCards] = card;
//		}
    console.log(`just grabbed ${card.name}`);
    numCards++;
  });

  return cardsArray;
};

module.exports = Scraper;
