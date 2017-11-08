import zipfile
import glob
import os
import urllib.request
import shutil

parsedDirectory = "workingDir"
if not os.path.exists(parsedDirectory):
    os.makedirs(parsedDirectory)
    
def parseZipFolder(fileName) :

    print("The program will now parse the file \""+fileName+"\"")

    print("Zip file extraction...")
    zip_ref = zipfile.ZipFile("./"+fileName + ".zip", "r")
    zip_ref.extractall('./' + fileName + '/')
    zip_ref.close()
    print("File unzipped !")

    print("Parsing csv file...")

    newFile = open("./" + parsedDirectory +"/" + fileName + ".csv", "w", encoding="utf8")

    #For each csv file that has been extracted from the zip :
    for filename in glob.glob(os.path.join(fileName, '*.csv')):
        with open(filename, encoding="utf8") as f:
            for line in f:
                code = line.split("\t")[28]
                if code == "02" or code == "07":
                    newFile.write(line)

    print("New file successfully created !")
    newFile.close()

#end of parseZipFolder

print("Welcome to the ultimate GDELT file downloader !")
print("This program will now make a new DB based on GDELT but only with events who's code start with 2 or 7")
print("Let's get started !")
linksFileName = "allzips.txt"
fileLength = sum(1 for line in open(linksFileName))
count = 0
with open(linksFileName, "r", encoding="utf8") as f:
    for link in f:
        #Remove the escape character
        link = link[:len(link)-1]
        #Download and save file
        front = "http://data.gdeltproject.org/events/"
        print("Downloading "+front+link+"...")
        urllib.request.urlretrieve(front+link, link)
        print("File Downloaded !")
        #Unzip and parse the retrieved file
        fileName = link.split(".")[0]
        parseZipFolder(fileName)
        #Delete the now unnecessary zip file
        print("Removing temporary files")
        os.remove(link)
        shutil.rmtree(fileName)
        count = count + 1
        print("Progression : "+str(count)+" / "+str(fileLength))

print("Program successfully terminated ! Congratulations !")