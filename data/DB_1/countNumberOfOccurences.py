import zipfile
import glob
import os
import urllib.request
import shutil

newFile = open("./couples.csv", "w", encoding="utf8")


count = 1
with open("links.csv", "r", encoding="utf8") as f:
    count = 1
    previousLine = ""
    for line in f:
        line = line.replace("\n", "")
        if (previousLine == line):
            count = count + 1 
        else:
            newFile.write("," + str(count) + "\n" + line)
            previousLine = line
            count = 1

newFile.close()


print("Program successfully terminated ! Congratulations !")
