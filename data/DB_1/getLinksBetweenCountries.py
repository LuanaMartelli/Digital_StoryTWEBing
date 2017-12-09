import zipfile
import glob
import os
import urllib.request
import shutil

  

newFile = open("./links.csv", "w", encoding="utf8")
newFile.write("actor1,actor2\n")

#For each csv file :
for filename in glob.glob(os.path.join(".", '*.csv')):
    print(filename)
    with open(filename, encoding="utf8") as f:
        for line in f:
            split = line.split("\t")
            actor1 = split[1]
            actor2 = split[2]
            newFile.write(actor1 + "," + actor2 + "\n")

print("New file successfully created !")
newFile.close()




print("Program successfully terminated ! Congratulations !")
