# dte-outage-tracker

Retrieve [DTE](https://www.dteenergy.com/) outage data.

## Retrieving historical data

The `main.mjs` script runs every hour on GitHub Actions.

- The script retrieves high-level data from the internal DTE [Kubra](https://www.kubra.com/) API and writes to `data-api.json`.
-The script also retrieves high-level data from the external-facing DTE dashboard and writes to `data-home.json`.
- In addition, the script writes to `data.csv` with more granular Kubra data based on ZIP Code.

The script overwrites these files on each run, but we are still able to retrieve historical data based on Git commit history using the [`git-history`](https://github.com/simonw/git-history) package authored by [Simon Willison](https://en.wikipedia.org/wiki/Simon_Willison).

### Setup

1. Run `python3 -m venv venv` to create a virtual environment.
2. Run `source venv/bin/activate` to activate the virtual environment.
3. Run `pip install -r requirements.txt` to install dependencies.

### Scripts

- Run `./data-api.sh` to generate a SQL database at `data-api.sqlite` of historical data based on `data-api.json` commit history.
- Run `./data-home.sh` to generate a SQL database at `data-home.sqlite` of historical data based on `data-home.json` commit history.
- Run `./data.sh` to generate a SQL database at `data.sqlite` of historical data based on `data.csv` commit history.

All pertinent data is stored in the `item` table.

These scripts will likely take several seconds to execute. Note that for both files, there will be a gap in data from March 1 to April 26 during which the `data-api.json` and `data-home.json` files did not exist in Git history. However, you can use the `archive/data-api.csv` and `archive/data-home.csv` files to fill in these gaps. The `data.csv` file does not have such a gap.

## Archive

### Data files

The `data-api.csv`, `data-home.csv` and `history.csv` files are analogous to the main `data-api.json`, `data-home.json` and `data.csv` files, respectively. These CSV files store data from around late February 2023 to late April 2023. During that time range, these were the primary storage files. On each workflow run, a line (or several lines in the case of `history.csv`) would be appended to the file. This was useful for conducting live visualizaiton, but also led to large file and repository sizes that slowed down the workflow. Consider that `history.csv` is 16 MB!

The `history-reduced.csv` file is a version of the `history.csv` file where entries from the same timestamp are compressed into one data row, summing across the total number of customers affected. This was useful for visualization performance purposes as it meant we could load a smaller file on the client.

### Backfill

The files in the `backfill` directory were used to backfill DTE outage data from their Kubra API that we had not been retrieving. In general, it is difficult to get historical data out of DTE. However, in our main script (`main.mjs`), we log out a Kubra URL slug that can be used to retrieve historical data. GitHub Actions store a record of anything logged by a workflow.

1. First, we retrieved the identifier of each GitHub Action workflow run with `gh run list --limit 1000 > action-runs.txt`. At the time we wanted to conduct the backfill, there were less than 1000 runs.
2. After compiling a list of run identifiers, we ran `./action-slugs.sh` to retrieve the Kubra URL slug logged from each run. The slugs were written to `action-slugs.txt`.
3. Then, we ran `node data-api.mjs` to backfill to the `data-api.csv` file.

### Miscellaneous

The `reconcile.mjs` script was used to merge a local temporary historical file with the main file. It was a one-off script.

## Related artifacts

- We wrote a [news briefing](https://www.michigandaily.com/news/news-briefs/massive-power-outage-in-ann-arbor-leaves-thousands-in-the-dark/) with visualizations of this data.
- Eric Lau used the data to [visualize discrepancies](https://twitter.com/erxclau/status/1631116061373345797?s=20) between external and internal DTE outage data.
- Eric Lau [presented](https://youtu.be/9WkSCphC9-o?t=12790) on the data to the Michigan Public Service Commission (MPSC) as part of a technical conference to address energy resiliency in Michigan.
- Simon Willison was written [several blog posts](https://simonwillison.net/series/git-scraping/) on using GitHub Actions and `git-history` to scrape data.
- Open Kentuckiana, a group of technologists from Kentucky, conducted a [similar power outage analysis](https://openkentuckiana.org/2019-12-18-power-utility-data/) using the Kubra API. Their analysis is more granular with respect to geospatial clusters of outages. Their repository also uses [`git-history`](https://github.com/openkentuckiana/power-outage-data).
