const fs = require('fs');

module.exports = {
  name: "scrape",
  description: "Returns a list of all the messages in the channel delimited by newline",

  run: async (client, interaction) => {
		
		// scraping process
		
		const allMessages = [];
		let lastLength = allMessages.length;
		let lastId;
		
		while (true) {
			let options = {cache: false};
			if (lastId) options.before = lastId;
			
			const messageScraper = await interaction.channel.messages.fetch(options)
				.then(messages => {		
					messages.forEach(message => {
						allMessages.push(message.content);
					});
					lastId = messages.last().id;
				})
				.catch(console.error);
				
			if (allMessages.length === lastLength) break;
			lastLength = allMessages.length;
		}
		
		// writing to file
		
		console.log(allMessages);
		
		fs.writeFile('./scraped_messages.txt', allMessages.join('\n'), err => {
			if (err) console.error(err);
		});
		
		// sending the file
		
		// interaction.followUp(`${lastLength} messages scraped`);
		
    interaction.followUp({files: [{
			attachment: './scraped_messages.txt',
			name: `${allMessages.length}_messages_scraped.txt`
		}]});
		
  },
};
