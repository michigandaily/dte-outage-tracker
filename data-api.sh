git-history file ./data-api.sqlite ./data-api.json \
  --convert '
data = json.loads(content)
return [
  {
    "total_affected": data["summaryFileData"]["totals"][0]["total_cust_a"]["val"],
    "total_percent_affected": data["summaryFileData"]["totals"][0]["total_percent_cust_a"]["val"],
    "total_percent_active": data["summaryFileData"]["totals"][0]["total_percent_cust_active"]["val"],
    "total_served": data["summaryFileData"]["totals"][0]["total_cust_s"],
    "total_outages": data["summaryFileData"]["totals"][0]["total_outages"],
    "date_generated": data["summaryFileData"]["date_generated"],
  }
]
'