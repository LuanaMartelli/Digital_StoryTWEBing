import zipfile
import glob
import os
import urllib.request
import shutil

  

newFile = open("./codes.csv", "w", encoding="utf8")
newFile.write("code\n")

#For each csv file :
for filename in glob.glob(os.path.join(".", '*.CSV.csv')):
    with open(filename, encoding="utf8") as f:
        for line in f:
            split = line.split("\t")
            code = split[3]

            newFile.write(code + "\n")

newFile.close()




print("Program successfully terminated ! Congratulations !")
