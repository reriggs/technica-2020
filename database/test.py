import pandas as pd
import sqlite3

df = pd.read_csv('database\lihtc_properties2.csv',header=0)

print(df.head())

db_conn = sqlite3.connect("./database/resources.db")
c = db_conn.cursor()

c.execute(
    """
    CREATE TABLE projects (
        hud_id STRING,
        project STRING,
        proj_add STRING,
        proj_st STRING,
        proj_zip STRING,
        contact STRING,
        PRIMARY KEY code STRING,
    )
    """
)



