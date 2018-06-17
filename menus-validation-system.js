// how to run this program: 
// node shopify_challenge.js 1
// node shopify_challenge.js 2

const https = require('https');

function explore(i, nodes, menu) {
	
	let ids = nodes[i].child_ids;
	let ret = true;
	for( let j = 0; j < ids.length ; j++ ){
		if(  menu.root_id != ids[j] && menu.children.indexOf(ids[j]) < 0 ){
			menu.children.push(ids[j]); 
			ret = explore( ids[j] - 1, nodes, menu ) && ret;
		} else {
			menu.children.push(ids[j]); 
			ret = false;
		}	
	}
	return ret;
}

function validateMenu(nodes) {
	/*
	  	menu ~ [ node, ... ] 
	*/
	var ret = { valid_menus : [], invalid_menus : [] };

	for( let i = 0; i < nodes.length; i ++){
		if(nodes[i].parent_id === undefined){
			let menu =  {root_id : i+1, children : [] };
			if(explore(i, nodes, menu)){
				ret.valid_menus.push(menu);
			}else{
				ret.invalid_menus.push(menu);
			}
         	}
	}

	return ret;

};



function requestPage(id, page, callback){
//http get request
	var req = https.request(
		{
			host: 'backend-challenge-summer-2018.herokuapp.com',
	      	port: '443',
			path: '/challenges.json?id='+ id + '&page=' + page,
			method: 'GET'
	  	},
	  	(res) => {
	  		
	  		if(res.statusCode == 200){
	  			res.on('data', (d) => callback(JSON.parse(d)) );
	  		}else {
	  			callback(undefined); //request fail
	  		}
		}
	);

	req.on('error', (e) => {
		console.error(e);
	});
//send
	req.end();
}


var challenge_id = Number(process.argv[2]);
var node_list = [];

//recursive call to upload all pages
function handleResponse(res){
//res is a javaScriot object
	if(res){
		if(Array.isArray(res.menus)) node_list = node_list.concat(res.menus);
		let p = res.pagination;
		if(p && (p.current_page * p.per_page < p.total)){
			requestPage(challenge_id, p.current_page + 1, handleResponse);
			return;
		}
	}

	process.stdout.write(JSON.stringify(validateMenu(node_list), null, 2) + '\n');
}

requestPage(challenge_id,0, handleResponse );
