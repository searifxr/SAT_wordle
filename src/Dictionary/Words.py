import requests
import json

def get_entry(word):
    res = requests.get(f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}")
    data = res.json()
    if isinstance(data, list):
        meaning = data[0]["meanings"][0]
        definition = meaning["definitions"][0]["definition"]
        synonyms = meaning["definitions"][0].get("synonyms", [])
        return definition, synonyms
    return None, []

words = ["YAWNER", "YEASTY", "YONDER", "ZEALOT", "ZINGER", "ZODIAC"]  # Example list

entries = {}
for w in words:
    defn, syns = get_entry(w.lower())
    entries[w.upper()] = {
        "definition": defn or "—",
        "synonym": syns[0] if syns else "—",
        "fun": f"Fun fact: \"{w}\" starts with '{w[0]}'!"
    }

print("export const definitions =", json.dumps(entries, indent=2), ";")
