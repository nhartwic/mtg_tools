
function scryfall_tools(){

    /**
     * Recursively get all cards from some uri then call func on the results
     */
    function get_all(uri, func){
        var cards = []
        function recursive_read(uri){
            d3.json(uri).then(function(result){
                cards = cards.concat(result.data)
                if(result.has_more){ recursive_read(result.next_page) }
                else {
                    func(cards)
                  }
              }
            )
        }
        recursive_read(uri)
    }

    /**
     * Grab relevant information
     */
    function clean_cards(cards){
        console.log(cards)
        return cards
    }

    return {
        "get_all": get_all,
        "clean_cards": clean_cards,
        "scryfall_uri": "https://api.scryfall.com/cards/search?q="
    }

}