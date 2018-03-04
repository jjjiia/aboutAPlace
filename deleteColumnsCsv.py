from functools import partial
import random
import pprint
import pylab
import csv
import math
import json
from math import radians, cos, sin, asin, sqrt
from shapely.geometry import *
from shapely.ops import cascaded_union
from operator import itemgetter
import time



def makeDictionary():
    
    with open("census_keys_short.json") as c:
        censusKeys = json.load(c)
        shortHeaders = censusKeys.keys()
    
    formatted ={}
    
    print shortHeaders
    
    with open("census_percent_2places.csv","Ur")as infile:
    
        csvReader = csv.reader(infile)  
        for row in csvReader:
            longHeaders = row
            break
      #  csvReader.next()
        with open("census_percent_2places_selected.csv","w")as outfile:
            csvWriter = csv.writer(outfile)
            csvWriter.writerow(["Gid"]+shortHeaders)
            for row in csvReader:
                data = row
                gid = data[0]
                entry = [row[0]]
                for h in shortHeaders:
                    headerCode = h
                    hIndex = longHeaders.index(h)
                    value = row[hIndex]
                
                    entry.append(value)
                
                csvWriter.writerow(entry)
                
                #if data[h]!="" and data[h]!="0":
                #    formatted[headers[h]].append(data[h])

    
makeDictionary()
