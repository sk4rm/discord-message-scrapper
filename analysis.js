const fs = require('fs');
const axios = require('axios');


// filter sauce

const sauceFilter = value => {
	if (!value) return false;	// empty strings
	if (value.startsWith('https')) return false; // links
	if (value.length === 6) return false; // nhentai codes
	return true;
};

const sauceHashes = 
	fs.readFileSync('./scraped_messages.txt', 'utf8')
	.split('\n')
	.filter(sauceFilter);
	
	
// helper function for http request

const md5Search = (hash, frequencyTable) => {
	const url = 'https://gelbooru.com/index.php';
	const config = {
		params: {
			page: 'dapi',
			s: 'post',
			q: 'index',
			tags: `md5:${hash}`,
			json: '1',
			api_key: process.env.GELBOORU_API_KEY,
			user_id: process.env.GELBOORU_USER_ID
		}
	};
	
	console.log(`Requesting tags for ${hash}...`);
	return axios
		.get(url, config)
		.then(res => {
			
			const posts = res.data.post;
			console.log(`Checking posts for hash ${hash}`);
			if (!posts) {
				console.log(`Couldn't find posts with hash ${hash} in Gelbooru!`);
				return;
			}
			console.log(`Post with hash ${hash} found!`)
			
			const tags = posts[0].tags.split(' ');
			
			// +1 to frequencyTable
			for (const tag of tags) {
				if (!frequencyTable[tag]) frequencyTable[tag] = 0;
				frequencyTable[tag] += 1;
			}
			
		})
		.catch(console.err);
};


// request tags from gelbooru api

const result = {}

const requests = [];
for (const hash of sauceHashes) {
	requests.push(md5Search(hash, result));
}


// print to txt file

Promise.all(requests)
	.then(_ => { 
		fs.writeFile('./sauce_tags.txt', JSON.stringify(result), e => console.log);
	});