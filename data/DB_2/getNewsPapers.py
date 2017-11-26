import zipfile
import glob
import os
import urllib.request
import shutil

  

newFile = open("./newspapers.csv", "w", encoding="utf8")
newFile.write("url\n")

#For each csv file :
for filename in glob.glob(os.path.join(".", '*.CSV.csv')):
    with open(filename, encoding="utf8") as f:
        for line in f:
            split = line.split("\t")
            url = split[10]
            start = url.find("//")
            if (start != -1):
                url = url[start + 2:]
            end = url.find("/")
            if (end != -1):
                url = url[:end]
            url = url.replace("www.", "")
            url = url.replace(".com", "")
            url = url.replace(".co", "")
            url = url.replace(".uk", "")
            url = url.replace("\n", "")

            newFile.write(url + "\n")

print("New file successfully created !")
newFile.close()




print("Program successfully terminated ! Congratulations !")
