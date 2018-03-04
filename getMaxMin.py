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


#open geojson, add each geo's data
#def makeDictionary():
#    formatted ={}
#    with open("census_percent.csv","Ur")as infile:
#    
#        csvReader = csv.reader(infile)  
#        for row in csvReader:
#            headers = row
#            for h in range(len(headers)):
#                formatted[headers[h]] = []
#        
#            break
#      #  csvReader.next()
#        for row in csvReader:
#            data = row
#            gid = data[0]
#            for h in range(len(headers)):
#                if data[h]!="" and data[h]!="0":
#                    formatted[headers[h]].append({"gid":gid,"value":data[h]})
#    return formatted
    
def makeDictionaryNumber():
    formatted ={}
    with open("census_percent_2places_selected_noId.csv","Ur")as infile:
    
        csvReader = csv.reader(infile)  
        for row in csvReader:
            headers = row
            for h in range(len(headers)):
                formatted[headers[h]] = []
        
            break
      #  csvReader.next()
        for row in csvReader:
            data = row
            gid = data[0]
            for h in range(len(headers)):
                if data[h]!="" and data[h]!="0":
                    formatted[headers[h]].append(float(data[h]))
    return formatted
#makeDictionary()
def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False
 
def makeMinMax():
 #   formatted = makeDictionary()
    formatted = makeDictionaryNumber()
    minMax = {}
    for f in formatted:
        print f
        #print formatted[f]
        #print f
        #print fNumbersOnly[f]
        #break
      #  if is_number(min(formatted[f]))==True:
        ##sortedf = formatted[f].sort()
        fmin = float(min(formatted[f]))
        fmax= float(max(formatted[f]))
        print fmin,fmax,f
        minMax[f] = {"min":fmin,"max":fmax}
    with open("minMax.json","w") as outfile:
        json.dump(minMax,outfile)

makeMinMax()
    
