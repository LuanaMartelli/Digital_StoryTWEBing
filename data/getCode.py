import zipfile
import glob
import os
import urllib.request
import shutil

  

newFile = open("./newspapers.csv", "w", encoding="utf8")
newFile.write("code\n")

#For each csv file :
for filename in glob.glob(os.path.join(".", '*.CSV.csv')):
    with open(filename, encoding="utf8") as f:
        for line in f:
            split = line.split("\t")
            code = split[4]

            if (code.cont)
            newFile.write(code + "\n")

newFile.close()



/*
023* coder à l'envers
0243
033*
07*
*/
print("Program successfully terminated ! Congratulations !")
