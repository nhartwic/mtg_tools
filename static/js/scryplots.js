st = scryfall_tools()

// var asfan_opt = d3.select("#asfan_control")

/**
 * construct the powerset of a set
 */
const getAllSubsets = theArray => theArray.reduce(
		(subsets, value) => subsets.concat(
			subsets.map(set => [value,...set])
		),
	[[]]
);

/**
 * equivalent to the following in python
 * list(zip(*data))
 */
function zip(data){
	var lens = data.map(l => l.length)
	var min_len = Math.max(...lens)
	var ret = []
	for(var i = 0; i < min_len; i++){
		ret.push(data.map(l => l[i]))
	}
	return ret
}


/**
 * equivalent to the following in python
 * list(range(start, stop, step))
 */
function range(stop, start=0, step=1){
	var ret = []
	for(var i=start; i< stop; i+=step){
		ret.push(i)
	}
	return ret
}


// access opt forms that will be needed for build_cmc_plot
var cmc_color_opt = d3.select("#cmc_color")
var cmc_type_opt = d3.select("#cmc_type")
var cmc_rarity_opt = d3.select("#cmc_rarity")
var opt_fields = [cmc_color_opt, cmc_type_opt, cmc_rarity_opt]


/**
 * TODO update to allow extracting all relevant data
 */
function build_cmc_plot(cards){

	function scrape(c){
		var types = "land creature artifact enchantment planeswalker instant sorcery".split(" ")
		var ret_types = []
		types.forEach(t => c.type_line.toLowerCase().includes(t) ? ret_types.push(t) : null )
		var color = c.color_identity.join("")
		color = color ? color : "C"
		return [[color, ret_types.join(" "), c.rarity], c.cmc]

	}
	// [color, types, rarity], cmc
	var card_data = cards.map(scrape)

	var keys = [
		cmc_color_opt.property("checked"),
		cmc_type_opt.property("checked"),
		cmc_rarity_opt.property("checked"),
	]

	card_data = card_data.map(function(cd){
		var temp = zip([keys, cd[0]]).reduce(
			(curr, d) => d[0] ? curr + " " + d[1] : curr,
			""
		)
		return [temp.slice(1,temp.length), cd[1]]
	})

	var data_dict = {}
	card_data.forEach(function(c){
		if(!(c[0] in data_dict)){
			data_dict[c[0]] = []
		}
		if(!(c[1] in data_dict[c[0]])){
			data_dict[c[0]][c[1]] = 0
		}
		data_dict[c[0]][c[1]] += 1
	})
	var data = Object.entries(data_dict).map(function(d){
		return {
			x: d[1].keys(),
			y: d[1],
			name: d[0],
			type: "bar"
		}
	})

	// create plot
	var layout = {
		barmode: "stack",
		title: "CMC of Cards"
	}

	Plotly.newPlot("cmc_plot", data, layout)
}


// access opt forms that will be needed for build mat plot
var rarity_toggles = {
	"common": d3.select("#mat_rarity_C"),
	"uncommon": d3.select("#mat_rarity_U"),
	"rare": d3.select("#mat_rarity_R"),
	"mythic": d3.select("#mat_rarity_M"),
}
opt_fields.push(...Object.values(rarity_toggles))

var color_toggles = {
	"W": d3.select("#mat_color_W"),
	"U": d3.select("#mat_color_U"),
	"B": d3.select("#mat_color_B"),
	"R": d3.select("#mat_color_R"),
	"G": d3.select("#mat_color_G"),
	"C": d3.select("#mat_color_C"),
}
opt_fields.push(...Object.values(color_toggles))

var cmc_toggles = {
	0: d3.select("#mat_cmc_0"),
	1: d3.select("#mat_cmc_1"),
	2: d3.select("#mat_cmc_2"),
	3: d3.select("#mat_cmc_3"),
	4: d3.select("#mat_cmc_4"),
	5: d3.select("#mat_cmc_5"),
	6: d3.select("#mat_cmc_6"),
	7: d3.select("#mat_cmc_7"),
}
mat_big_cmc_toggle = d3.select("#mat_cmc_8")
opt_fields.push(...Object.values(cmc_toggles))
opt_fields.push(mat_big_cmc_toggle)


/**
 * TODO : Update to use customized d3 logic as plotly doesn't support the desired slicing behavior
 */
function build_mat_plot(cards){
	// parse cards
	cards = cards.filter( c => "power" in c)
	cards = cards.map(c => [
		[
			parseInt(c.power!="*" ? c.power : "0"),
			parseInt(c.toughness!="*" ? c.toughness : "0")
		],
		[c.rarity, c.cmc, c.color_identity.length==0 ? ["C"] : c.color_identity]
	])
	var valid_rarities = Object.entries(rarity_toggles).filter(
		t => t[1].property("checked")
	).map(t => t[0])
	cards = cards.filter(c => valid_rarities.includes(c[1][0]))

	var valid_colors = Object.entries(color_toggles).filter(
		t => t[1].property("checked")
	).map(t => t[0])
	cards = cards.filter(c => valid_colors.some(col => c[1][2].includes(col)))

	var valid_cmcs = Object.entries(cmc_toggles).filter(
	 	t => t[1].property("checked")
	 ).map(t => parseInt(t[0]))
	var big_cmc = mat_big_cmc_toggle.property("checked")
	cards = cards.filter(c => valid_cmcs.includes(c[1][1]) || (big_cmc && c[1][1] >= 8))

	var pmax = Math.max(...cards.map(c => c[0][0])) + 1
	var tmax = Math.max(...cards.map(c => c[0][1])) + 1
	var xValues = range(pmax)
	var yValues = range(tmax)

	var zValues = yValues.map(i => xValues.map(j => 0))
	cards.forEach(function(c){
		zValues[c[0][1]][c[0][0]] += 1
	})

	var data = [{
		x: xValues,
		y: yValues,
		z: zValues,
		type: 'heatmap',
		showscale: false,
		colorscale: [[0, "#0000A0"], [1, "#ADD8E6"]]
	}]

	var layout = {
		title: 'Creature Sizes',
		annotations: [],
		xaxis: {title:{text:"Power"}},
		yaxis:{title:{text:"Toughness"}}
	}

	for ( var i = 0; i < yValues.length; i++ ) {
		for ( var j = 0; j < xValues.length; j++ ) {
			var result = {
				x: xValues[j],
				y: yValues[i],
				text: zValues[i][j],
				showarrow: false,
				font: {
					family: 'Arial',
					size: 24
				},
			}
			layout.annotations.push(result)
		}
	}

	Plotly.newPlot('mat_plot', data, layout)
}


/**
 * main function which will build both plots. Relies on the state of "cards"
 */
function main(){
	console.log(cards)
	build_cmc_plot(cards)
	build_mat_plot(cards)
}


//define dummy cards var
cards = []

// Get access to query field
var query_form = d3.select("#scry_query")
var loading_zone = d3.select("#loading_div")


function execute_query(){
	loading_zone.html("<h1>LOADING</h1>")
	query_input = query_form.property("value")
	query_uri = st.scryfall_uri + encodeURIComponent(query_input)
	console.log(query_uri)

	function clear_load(query_cards){
		cards = query_cards
		loading_zone.html("")
		main()
	}
	
	st.get_all(query_uri).then(clear_load).catch(e => clear_load([]))
}

// Do init build with default query (current set)
execute_query()

// When user changes search criteria
query_form.on("change", execute_query)
opt_fields.forEach(f => f.on("change", main))

// When user clicks on "Scryfall", link to current scrfall page
var scry_label = d3.select("#scrylink")
scry_label.on("click", function(){
	query_input = query_form.property("value")
	query_uri = st.scryfall_url + encodeURIComponent(query_input)
	window.open(query_uri)
})