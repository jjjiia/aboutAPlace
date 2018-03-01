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


notPercentCategories = ["T057_001","T059_001","T083_001","T147_001","T002_001","T002_002","T002_003","T157_001"]

        

        
def openGeojson():
    with open("censusDictionary.json") as c:
        census = json.load(c)
    count = 0
    
   # with open("census_percent.csv","w") as o:
   #     csvWriter = csv.writer(o)
    
    percentDictionary = {}
    
    for g in census:
        count+=1
        entry = census[g]
        percentDictionary[g]={}
        for e in entry:
            key = e
            value = entry[e]
            if value == "":
                value = 0
            if key.replace("SE_","") in notPercentCategories or key.split("_")[0]=="Geo" :
                percentDictionary[g][key]=value
            else:
                totalKey = e.split("_")[0]+"_"+e.split("_")[1]+"_001"
                totalValue = entry[totalKey]
                if float(value) > 0:
                    #print totalValue,value
                    percent = round(float(value)/float(totalValue)*100,2)
                    percentDictionary[g][key]=percent
                else:
                    percentDictionary[g][key]=0
                #print "percent",key,value
            
        if count%100==0:
            print count
    # print percentDictionary
    with open("census_percent_2places.json","w")as outfile:
        json.dump(percentDictionary,outfile)
#
#openGeojson()

def jsonToCsv():
    with open("census_percent_2places.json") as c:
        census = json.load(c)
    count = 0
    firstGid = census.keys()[0] 
    headers = ["Gid"]+census[firstGid].keys()
#    headers.append(census[firstGid].keys())
    #print headers
    with open("census_percent_2places.csv","w")as out:
        csvWriter = csv.writer(out)
        csvWriter.writerow(headers)
        for c in census:
            entry = []
            gid = c
            entry.append(gid)
            data = census[c]
            for h in headers:
                if h!="Gid":
                    entry.append(data[h])
            csvWriter.writerow(entry)
        
#jsonToCsv()

#print u" Do\xd0a Ana County, New Mexico"
#print unicode("Do\xd0a Ana County, New Mexico","utf-8")

def csvToJson():
    out = {}
    with open("geo_names.csv","Ur")as infile:
        csvReader = csv.reader(infile)
        for row in csvReader:
            gid = row[0]
            name = unicode(row[1], "utf-8")
            out[gid]=name
            
            #print name,str(name)
    with open("geo_names.json","w")as outfile:
        json.dump(out,outfile)
#csvToJson()
def getDeviation():
    dictionary = {}
    with open("deviation_format.csv","w")as csvOut:
        csvWriter=csv.writer(csvOut)
        with open("deviation.csv","Ur")as infile:
            csvReader = csv.reader(infile)
            for row in csvReader:
                headers = row
                break
          #  csvReader.next()
            for row in csvReader:
                data = row
                break
            for h in range(len(headers)):
                print headers[h],data[h]
                dictionary[headers[h]]=data[h]
                csvWriter.writerow([headers[h],data[h]])
    with open("deviation.json","w") as outfile:
        json.dump(dictionary,outfile)
        
        
def makeHistogram():
    with open("R11591277_SL140.csv","Ur")as infile:
        csvReader = csv.reader(infile)
        for row in csvReader:
            print row
            break
            
            
makeHistogram()