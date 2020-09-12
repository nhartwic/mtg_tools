console.log(math.sqrt(5))

// Define Ranks
rank_info = {
	Bronze : {
		win: 2,
		loss: 0,
		lstep: 4,
		cstep: 6,
	},
	Silver : {
		win: 2,
		loss: -1,
		lstep: 5,
		cstep: 6,
	},
	Gold : {
		win: 1,
		loss: -1,
		lstep: 5,
		cstep: 6,
	},
	Diamond : {
		win: 1,
		loss: -1,
		lstep: 5,
		cstep: 6
	},
	Platinum : {
		win: 1,
		loss: -1,
		lstep: 5,
		cstep: 6
	}
}

// When tier (1-3) step 0 is reached, up to tier_protection losses
// in a row will be ignored. 
tier_protection = 3

console.log(rank_info)
var form_winrate = d3.select("#in_winrate")
var form_rank = d3.select("#sel_rank")
var form_tier = d3.select("#sel_tier")
var form_step = d3.select("#sel_step")
var form_format = d3.select("#sel_format")

var forms = [form_winrate, form_rank, form_tier, form_step, form_format]

/** parse inputs from form fields
  */
function get_inputs(){	
	return {
		wr : parseFloat(form_winrate.property("value")) / 100,
		rank: form_rank.property("value"),
		tier: parseInt(form_tier.property("value")),
		step: parseInt(form_step.property("value")),
		format: form_format.property("value"),
	}
}


/** Create the transition state diagram some win rate, rank, and format
  */
function create_tsm(wr, rank_info, format, protected_tiers){
	var rows = []
	var steps = (format == 'Limited' ? rank_info['lstep'] : rank_info['cstep'])
	var w = rank_info['win']
	var l = rank_info['loss']
	var total_nodes = steps * 4 + 3 * protected_tiers
	console.log(total_nodes)
	var ret = math.zeros(total_nodes, total_nodes)
	cur_node = 0
	for (var t = 0; t < 4; t++){
		//handle tier protection
		if(t > 0){
			for (var p = 0; p < protected_tiers; p++){

			}
		}
		for (var s = 0; s < steps; s++){
		}
	}
}

/** Compute Mean number of games to rank up
  */
function compute_ev(tsm){
	return 0
}


/** For a number of games in range 0 - ev*1.5, compute probability of rank up
  */
function gen_data(tsm, tier, step, ev){
	return 0
}

// some fake data for testing. Limited Bronze 4-0 with WR=0.5
var fake_data = {
	ngames : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22],
	prank : [0,0,0,0,0,0,0,
			0.00390625, 0.01953125, 0.0546875,
			0.11328125, 0.19384765625, 0.29052734375,
			0.39526367188, 0.5, 0.59819030761,
			0.68547058105, 0.75965881348, 0.82035827637,
			0.86841201782, 0.90537643432, 0.9330997467]
}

/** Create a trace using data.x and data.y
  */
function make_plot(data){
	var trace = {
		x: data.ngames,
		y: data.prank,
		fill: 'tozeroy',
		type: 'scatter',
		mode: 'none'
	};
	var layout = {
		title: 'Probability of Rank Up vs Number of Games',
		height: 600,
		yaxis: {range: [0, 1]}
	};
	Plotly.react('plot', [trace], layout, {responsive: true});
}

/** Main method for this app. Steps of main are
  * 	1. Get inputs
  *		2. Create Transition State Matrix
  *		3. Compute EV of rank up
  *		4. Compute probability of rank up across large number of games
  *		5. Plot probability of rank up vs number of games
  */
function main(){
	var inputs = get_inputs()
	console.log(inputs)
	tsm = create_tsm(inputs.wr, rank_info[inputs.rank], inputs.format, tier_protection)
	make_plot(fake_data)
	console.log(math.zeros(30,20))
}


main()
// whenever the input changes, call main again.
forms.forEach(x => x.on("change", main))
