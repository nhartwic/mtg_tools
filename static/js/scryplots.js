st = scryfall_tools()

var asfan_opt = d3.select("#asfan_control")

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
	pos = [0, 1, 2, 3]
	labels = ["none", "type", "color", "type-color"]
	args = [
		[true, false, false],
		[true, true, false],
		[false, true, true],
		[true, false, true]
	]
	buttons = pos.map(function(p){
		return {
			label: labels[p],
			method: "restyle",
			args: ["visible", args[p]]
		}
	})
	menu = [{
		buttons: buttons,
        direction: 'left',
        pad: {'r': 10, 't': 10},
        showactive: true,
        type: 'buttons',
        x: 0.1,
        xanchor: 'left',
        y: 1.118,
        yanchor: 'top'
	}]

	annot = [{
		text: 'Slices:',
		x: 0,
		y: 1.05,
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



function main(cards){
	console.log(cards)
	build_cmc_plot(cards)
}




// Get access to query field
var query_form = d3.select("#scry_query")
var loading_zone = d3.select("#loading_div")
//loading_zone.html("<h1>INIT LOAD</h1>")

function execute_query(){
	loading_zone.html("<h1>LOADING</h1>")
	query_input = query_form.property("value")
	query_uri = st.scryfall_uri + encodeURIComponent(query_input)
	console.log(query_uri)

	function clear_load(cards){
		loading_zone.html("")
		main(cards)
	}
	
	st.get_all(query_uri, clear_load)
}

execute_query()

query_form.on("change", execute_query)
