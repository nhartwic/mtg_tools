// define starting set and URL for set information
const URL = "https://api.scryfall.com/sets/"
const start_set = "rna"
var set_data = null


function remove_dups(some_list){
  var seen = {}
  return some_list.filter(function(item){
    if(item in seen){return false}
    else {
      seen[item] = true
      return true
    }
  })
}


// define key vals
keys = [
  "name", "mana_cost", "cmc",
  "type_line", "oracle_text", "power",
  "toughness", "loyalty", "rarity",
  "colors", "color_identity",
  "collector_number", "artist", "usd"
]

rarity_map = {
  "mythic": "M",
  "common": "C",
  "rare": "R",
  "uncommon": "U"
}

transforms = [
  function(x){x['CI'] = x.color_identity},
  function(x){x['P'] = x.power},
  function(x){x['T'] = x.toughness},
  function(x){x['L'] = x.loyalty},
  function(x){x['CN'] = x.collector_number},
  function(x){x['cost'] = x.mana_cost},
  function(x){x['R'] = rarity_map[x.rarity]},
  function(x){x['text'] = x.oracle_text.replace(/\n/g, "<br>")},
]

display_keys = [
  "name", "cost", "cmc", "type_line",
  "text", "P", "T", "L", "R", "colors",
  "CI", "CN", "artist", "usd"
]

// Select document objects
var tbl = d3.select(".table")
var imf = d3.select(".image_field")
var dpm = d3.select("#sel1")
var table_opt = d3.select("#table_control")
var img_opt = d3.select("#image_control")
imf.html("<h1>Loading</h1>")

function create_table(){
  tbl.html("")
  if(!table_opt.property("checked")){
    return
  }
  var head_row = tbl.append("thead").append("tr")
  display_keys.forEach(function(k){
    head_row.append("th").text(k)
  })
  var body = tbl.append("tbody")
  set_data.forEach(function(card){
    var body_row = body.append("tr")
    display_keys.forEach(function(k){
      if(k in card){body_row.append("td").html(card[k])}
      else {body_row.append("td")}
    })
  })
  sorttable.makeSortable(tbl.node())
}


function clean_cards(){
  var temp = set_data.map(function(card){
    if("card_faces" in card){
      cards = card.card_faces
      var ret = cards.map(function(c){
        keys.forEach(function(k){
          if(!(k in c)){
            c[k] = card[k]
          }
        })
        if(!("image_uris" in c)){
          c.image_uris = card.image_uris
        }
        return c
      })
      return ret
    }
    else {return [card]}
  })
  return temp.flat()
}


function populate_page(){
  set_data = clean_cards(set_data)
  imf.html("")
  var set_uris = set_data.map(x => x.image_uris.normal)
  set_uris = remove_dups(set_uris)
  if(img_opt.property("checked")){
    set_uris.forEach(function (card){
      imf.append("img")
           .attr("src", card)
           .attr("class", "img-responsive")
           .attr("style", "float: left; margin-right: 1%; margin-bottom: 0.5em;")
           .attr("height", 352)
           .attr("width", 252)
    })
  }
  set_data.forEach(o => transforms.forEach(f => f(o)))
  var display_data = []
  set_data.forEach(function(card){
    var temp = {}
    display_keys.forEach(function(k){temp[k] = card[k]})
    display_data.push(temp)
  })
  create_table(display_data)
}

// Function gets all card data given a set_code then invokes
// populate_page to reset the page
function load_set(set_code, sets){
  var set_uri = sets.filter(x => x.code == set_code)[0].search_uri
  var cards = []
  function recursive_read(uri){
    d3.json(uri).then(function(result){
          cards = cards.concat(result.data)
          if(result.has_more){ recursive_read(result.next_page) }
          else {
            set_data = cards
            populate_page()
          }
      }
    )
  }
  recursive_read(set_uri)
}


// function performs inital page build once sets query has been
// Executed
function init_build(result){
  var set_results = result.data
  var set_codes = set_results.map(x => x.code).sort()

  // populate drop down
  set_codes.forEach( function(x) {
    dpm.append("option").text(x)
  })

  dpm.on("change", function(){
    set_code = dpm.node().value
    if(set_code == "Set Code"){ return null}
    tbl.html("")
    imf.html("<p>Resetting the page</p>")
    load_set(set_code, set_results)
  })
  // populate page using default set
  dpm.node().value = start_set
  load_set(start_set, set_results)
}

table_opt.on("change", populate_page)
img_opt.on("change", populate_page)
// Execute initial query to fetch set codes and uri then build the page
d3.json(URL).then(init_build)
