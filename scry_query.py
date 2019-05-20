import requests
import argparse
from urllib.parse import quote
import sys
import codecs


scry_uri = "https://api.scryfall.com/cards/search?q="
scry_url = "https://scryfall.com/search?q="


def access_scryfall(scry_args):
	scry_args = " ".join(scry_args)
	result = requests.get(scry_uri + quote(scry_args)).json()
	cards = result["data"]
	while(result["has_more"]):
		result = requests.get(result["next_page"]).json()
		cards.extend(result["data"])
	return cards


def reformat_card(card):
	ret = {}
	ret["name"] = card["name"]
	ret["cost"] = card["mana_cost"]
	ret["cmc"] = card["cmc"]
	c = ''.join(card["colors"])
	ret["colors"] = c if(c != "") else "C"
	c = "".join(card["color_identity"])
	ret["ci"] = c if(c != "") else "C"
	ret["type"] = card["type_line"]
	ret["p"] = card.get("power", "")
	ret["t"] = card.get("toughness", "")
	ret["rarity"] = card["rarity"][0]
	ret["text"] = card["oracle_text"]
	ret["num"] = int(card["collector_number"])
	return ret


def main():
	parser = argparse.ArgumentParser(
		description="Access scryfall api, flatten results and dump to temp.txt"
	)
	parser.add_argument(
		"scry_args",
		nargs="+",
		help="scryfall arguments. For exmaple 'set:war is:booster'"
	)
	args = parser.parse_args()
	raw_cards = access_scryfall(args.scry_args)
	cards = list(map(reformat_card, raw_cards))
	keys = [
		"name", "cost", "cmc", "colors", "ci",
		"type", "p", "t", "rarity", "text", "num"
	]
	# sys.stdout = codecs.getwriter('utf-16')(sys.stdout)
	outstrs = []
	outstrs.append("\t".join(keys))
	for c in sorted(cards, key=lambda c: c["num"]):
		outstrs.append("\t".join(str(c[k]) for k in keys))
	with open("temp.txt", "w", encoding="utf-8") as f:
		for l in outstrs:
			f.write(l.replace("\n", ";; ") + "\n")


if(__name__ == "__main__"):
	main()
