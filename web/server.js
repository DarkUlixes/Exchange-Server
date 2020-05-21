const express = require('express')
const http = require('http')
const ws = require('ws');

const app = express()
const server = http.createServer(app);
const wss = new ws.Server({ server });
const port = 8080;

const data = [
	{
		name: "USD",
		buy: 1.00,
		sell: 1.01
	},
	{
		name: "EUR",
		buy: 1.00,
		sell: 1.01
	},
	{
		name: "AUD",
		buy: 1.00,
		sell: 1.01
	},
	{
		name: "CAD",
		buy: 1.00,
		sell: 1.01
	},
	{
		name: "CHF",
		buy: 1.00,
		sell: 1.01
	},
	{
		name: "DKK",
		buy: 1.00,
		sell: 1.01
	},
	{
		name: "GBP",
		buy: 1.00,
		sell: 1.01
	},
	{
		name: "JPY",
		buy: 1.00,
		sell: 1.01
	},
	{
		name: "NOK",
		buy: 1.00,
		sell: 1.01
	},
	{
		name: "SEK",
		buy: 1.00,
		sell: 1.01
	}
]
const currencies = [
	"USD",
	"EUR",
	"AUD",
	"CAD",
	"CHF",
	"DKK",
	"GBP",
	"JPY",
	"NOK",
	"SEK"
]

const options = {
	dotfiles: 'ignore',
	etag: false,
	extensions: ['html'],
	index: 'index.html',
	maxAge: '12h',
	redirect: true,
	setHeaders: (res, path, stat) => {
		res.set('x-built-by', 'rxa')
	}
}
app.use(express.static('./static/', options));

wss.on('connection', (ws) => {
	payload = {
		currency: "all",
		data: data
	};
	ws.send(JSON.stringify(payload));

	ws.on('message', (msg) => {
		let newValue = null;
		try{ 
			newValue = JSON.parse(msg);
		} catch {
			console.err('malformed json');
			return;
		}
		if(currencies.includes(newValue.name)
			&& newValue.sell !== null
			&& newValue.buy !== null) {
				update(newValue, ws);
		} else {
			console.err('malformed json');
		}
	})

	ws.on('datachange', () => {
		wss.broadcast(payload);
	});
})

wss.broadcast = (data) => {
	wss.clients.forEach((client) => {
		client.send(JSON.stringify(data));
	})
}

server.listen(8080, () => {
	console.log(`listening on ${port}`);
})

function update(newValue, ws){
	let obj = data.find(obj => newValue.name === obj.name);
	let ix = data.indexOf(obj);
	if(ix === -1) {
		console.err('currency not found');
		return;
	};

	data[ix] = newValue;
	payload.data = newValue;
	payload.currency = newValue.name;

	ws.emit('datachange');
}