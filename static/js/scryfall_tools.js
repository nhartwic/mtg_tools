
function scryfall_tools(){

    /**
     * wait ms milliseconds
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Async function which will iteratively get all data from input scryfall
     * uri waiting 200 milliseconds between api calls.
     */
    async function get_all(uri){
        var timestamp = 0

        var cards = []

        do{
            var curr_time = new Date().getTime()
            while(curr_time - timestamp < 200){
                console.log(curr_time)
                await sleep(50)
                curr_time = new Date().getTime()
            }
            timestamp = curr_time
            var result = await d3.json(uri)
            cards = cards.concat(result.data)
            uri = result.next_page
        } while(result.has_more)

        return cards
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
        "scryfall_uri": "https://api.scryfall.com/cards/search?q=",
        "scryfall_url": "https://scryfall.com/search?q="
    }

}