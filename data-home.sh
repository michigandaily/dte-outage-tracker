git-history file ./data-home.sqlite ./data-home.json \
  --convert '
data = json.loads(content)
return [
  {
    "date_generated": data["lastUpdated"],
    "number_crews": data["currentSituations"][0]["displayValue"],
    "number_customers_affected": data["currentSituations"][1]["displayValue"],
    "percent_with_power": data["currentSituations"][2]["displayValue"]
  }
]
'