import requests
import argparse
from urllib.parse import quote
import sys
import codecs
import json

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


def get_text_field(card, field):
	if(field in card):
		return card[field]
	elif("card_faces" in card):
		rets = [cf[field] for cf in card["card_faces"] if(field in cf)]
		return '\n////\n'.join(rets)
	else:
		return ""


def get_list_field(card, field):
	if(field in card):
		return card[field]
	elif("card_faces" in card):
		rets = [f for cf in card["card_faces"] for f in cf.get(field, [])]
		return rets
	else:
		return []


def reformat_card(card):
	try:
		text_fields = [
			"name", "mana_cost", "cmc", "color_identity", "type_line", "power", "toughness", "rarity",
			"oracle_text", "collector_number"
		]
		ret = {t: get_text_field(card, t) for t in text_fields}
		ci = get_list_field(card, "color_identity")
		ret["color_identity"] = ''.join(ci) if len(ci) > 0 else "C"
		ot = ret["oracle_text"]
		ret["oracle_text"] = "\\" + ot if(len(ot) > 0 and ot[0] == "+") else ot
		ret["rarity"] = ret["rarity"][0]
		return ret

		ret["name"] = card["name"]
		ret["cost"] = card["mana_cost"] # .get("mana_cost")
		ret["cmc"] = card["cmc"]
		c = ''.join(card.get("colors", ''))
		ret["colors"] = c if(c != "") else "C"
		c = "".join(card["color_identity"])
		ret["ci"] = c if(c != "") else "C"
		ret["type"] = card["type_line"]
		ret["p"] = card.get("power", "")
		ret["t"] = card.get("toughness", "")
		ret["rarity"] = card["rarity"][0]
		ot = get_field(card, "oracle_text") # card.get("oracle_text", "")
		ret["text"] = "\\" + ot if(len(ot) > 0 and ot[0] == "+") else ot
		ret["num"] = card["collector_number"]
		return ret
	except:
		print(json.dumps(card, indent=4))
		raise


def main():
	parser = argparse.ArgumentParser(
		description=(
			"Access scryfall api, flatten results and dump to temp.txt. "
			'Use =REGEXREPLACE(A2,";;",CHAR(10)) to reinsert new lines in '
			"google sheets"
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
		"name", "collector_number", "mana_cost", "cmc", "color_identity",
		"type_line", "power", "toughness", "rarity", "oracle_text", 
	]
	# sys.stdout = codecs.getwriter('utf-16')(sys.stdout)
	outstrs = []
	outstrs.append("\t".join(keys))
	for c in sorted(cards, key=lambda c: c["collector_number"]):
		outstrs.append("\t".join(str(c[k]) for k in keys))
	with open("temp.txt", "w", encoding="utf-8") as f:
		for l in outstrs:
			f.write(l.replace("\n", ";; ") + "\n")


if(__name__ == "__main__"):
	main()
	"""
	def read_cards(fpath):
		with open(fpath) as fin:
			data = fin.read()
		return data.split("\n")[:-1]

	f1 = "rspc_20162017.txt"
	f2 = "rspc_20162018_merged.txt"
	f3 = "rspc_20172018.txt"
	f1 = read_cards(f1)
	f2 = read_cards(f2)
	f3 = read_cards(f3)
	print(" or ".join(['!"' + s + '"' for s in f3]))
	"""

