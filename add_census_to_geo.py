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

# make dictionary for census data by id
#open geojson, add each geo's data



        
def getCensus(censusFile):
    formatted ={}
    with open(censusFile,"r")as ids:
        csvReader = csv.reader(ids)
        for r in csvReader:
            header = r
            break
        csvReader.next()
        for row in csvReader:
            gid = row[1]
            formatted[gid]={}
            for h in header:
                hIndex = header.index(h)
                if h.split("_")[0]!="Geo":
                    value = row[hIndex]
                    if value != "0":
                        formatted[gid][h.replace("SE_","")]=row[hIndex]

        with open("censusDictionary_noZeros.json","w")as outfile:
            json.dump(formatted,outfile)
        return formatted          
        
getCensus("R11591277_SL140.csv")


        
def openGeojson():
    #census = getCensus("R11591277_SL140.csv")
    with open("censusDictionary.json") as c:
        census = json.load(c)
    print len(census.keys())
    print census.keys()[0:10]
    count = 0
    
    with open("alltracts.geojson") as g:
        tracts = json.load(g)
        print "open geojson"
        for t in tracts["features"]:
            count+=1
            if count%100==0:
                print count
            gid = t["properties"]["AFFGEOID"].replace("1400000US","14000US")
            if gid in census.keys():
                t["properties"]["census"]= census[gid]
           # print t
        
    with open("tracts_with_census.json","w")as outfile:
        json.dump(tracts,outfile)

#openGeojson()
