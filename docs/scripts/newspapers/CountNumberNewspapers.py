import zipfile
import glob
import os
import urllib.request
import shutil
from collections import Counter

newFile = open("./nbnewspapers.tsv", "w", encoding="utf8")

file = open("newspapers.csv", "r", encoding="utf8")
wordcount = Counter(file.read().split())
newFile.write("newspaper\tnumber\n")
for item in wordcount.most_common(30):
    newFile.write("{}\t{}\n".format(*item))




print("Program successfully terminated ! Congratulations !")
