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
	console.log(card_data)

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
	console.log(card_data)

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
	console.log(data_dict)
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

/**
 * TODO : Update to use customized d3 logic as plotly doesn't support the desired slicing behavior
 */
function build_mat_plot(cards){
	// parse cards
	var xValues = ['A', 'B', 'C', 'D', 'E']

	var yValues = ['W', 'X', 'Y', 'Z']

	var zValues = [
		[1, 2, 2, 1, 0],
		[1, 2, 3, 2, 1],
		[0, 1, 2, 2, 1],
		[0, 0, 0, 1, 1],
	]

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
		annotations: []
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
	
	st.get_all(query_uri).then(clear_load)
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