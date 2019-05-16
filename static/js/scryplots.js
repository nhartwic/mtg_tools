st = scryfall_tools()

var asfan_opt = d3.select("#asfan_control")

const getAllSubsets = theArray => theArray.reduce(
		(subsets, value) => subsets.concat(
			subsets.map(set => [value,...set])
		),
	[[]]
);

/**
 * TODO update to allow extracting all relevant data
 */
function build_cmc_plot(cards){

	// Count of card types/color identity / cmc

	// Create traces
	var data = [
		{
			x: [0,1,2,3,4,5,6,7,8],
			y: [8,7,6,5,4,3,2,1,1],
			name: "test_data_1",
			type: "bar",
		}, {
			x: [0,1,2,3,4,5,6,7,8],
			y: [4,4,4,4,4,4,4,4,4],
			name: "test_data_2",
			type: "bar",
			visible: false
		}, {
			x: [0,1,2,3,4,5,6,7,8],
			y: [3,2,1,1,1,1,2,3,4],
			name: "test_data_3",
			type: "bar",
			visible: false
		}
	]

	// generate buttons
	var slices = ["type", "color", "rarity"]
	var labels = getAllSubsets(slices)
	labels = labels.map(l => l.length < 3 ? l.join("+") : "all")
	var args = [
		[true, false, false],
		[true, true, false],
		[false, true, true],
		[true, false, true],
		[true, false, false],
		[true, true, false],
		[false, true, true],
		[true, false, true],
		[true, false, true]
	]
	var buttons = labels.map(function(_, i){
		return {
			label: labels[i],
			method: "restyle",
			args: ["visible", args[i]]
		}
	})
	var menu = [{
		buttons: buttons,
		direction: 'left',
		pad: {'r': 10, 't': 10},
		showactive: true,
		type: 'buttons',
		x: 0.1,
		xanchor: 'left',
		y: 1.17,
		yanchor: 'top'
	}]

	var annot = [{
		text: 'Slices:',
		x: 0,
		y: 1.11,
		yref: 'paper',
		align: 'left',
		showarrow: false
	}]

	// create plot
	var layout = {
		barmode: "stack",
		updatemenus: menu,
		annotations: annot,
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
		colorscale: [[0, "#0000A0"], [1, "#ADD8E6"]],
		name: "test"
	}, {
		x: xValues,
		y: yValues,
		z: zValues,
		type: 'heatmap',
		showscale: false,
		colorscale: [[0, "#0000A0"], [1, "#ADD8E6"]],
		name: "test2"
	}]

	var cmc_buttons = []
	for (var i = 0; i < 8; i++){
		cmc_buttons.push({
			label: i,
			method: "restyle",
			args: ["visible", []]
		})
	}
	var rarity_buttons = ["common", "uncommon", "rare", "mythic"]
	rarity_buttons = rarity_buttons.map(function(s){
		return {
			label: s,
			method: "restyle",
			args: ["visible", []]
		}
	})

	var menu = [
		{
			buttons: cmc_buttons,
			direction: 'left',
			pad: {'r': 10, 't': 10},
			showactive: true,
			type: 'buttons',
			x: 0.1,
			xanchor: 'left',
			y: 1.3,
			yanchor: 'top'
		}, {
			buttons: rarity_buttons,
			direction: 'left',
			pad: {'r': 10, 't': 10},
			showactive: true,
			type: 'buttons',
			x: 0.1,
			xanchor: 'left',
			y: 1.17,
			yanchor: 'top'
		}
	]

	var annot = [
		{
			text: 'CMC:',
			x: -0.2,
			y: 1.25,
			yref: 'paper',
			align: 'left',
			showarrow: false
		}, {
			text: 'rarity:',
			x: -0.2,
			y: 1.11,
			yref: 'paper',
			align: 'left',
			showarrow: false
		}
	]
	var layout = {
		title: {
			text: 'Creature Sizes',
			x: 0.8
		},
		updatemenus: menu,
		annotations: annot
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
 * main function which will build both plots
 */
function main(cards){
	console.log(cards)
	build_cmc_plot(cards)
	build_mat_plot(cards)
}




// Get access to query field
var query_form = d3.select("#scry_query")
var loading_zone = d3.select("#loading_div")

function execute_query(){
	loading_zone.html("<h1>LOADING</h1>")
	query_input = query_form.property("value")
	query_uri = st.scryfall_uri + encodeURIComponent(query_input)
	console.log(query_uri)

	function clear_load(cards){
		loading_zone.html("")
		main(cards)
	}
	
	st.get_all(query_uri).then(clear_load)
}

execute_query()

query_form.on("change", execute_query)
