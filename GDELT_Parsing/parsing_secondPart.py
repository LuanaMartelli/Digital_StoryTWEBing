import zipfile
import glob
import os
import urllib.request
import shutil

parsedDirectory = "workingDir"
linksFileName = "allzips_with_url.txt"
fileLength = sum(1 for line in open(linksFileName))
wantedColumns = [0,1,6,16,26,30,31,32,33,34, 57]

print("Welcome to the ultimate GDELT file downloader !")
print("This program will now make a new DB based on GDELT but only with events who's code start with 2 or 7")
print("Let's get started !")

#create Working Directory if doesn't exists
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
                actor1 = line.split("\t")[6]
                actor2 = line.split("\t")[16]
                url = line.split("\t")[57]
                if code == "02" or code == "07":
                	if actor1 and actor2 and url:
	                    #Filter the results to have only interesting columns
	                    columnsTable = line.split('\t')
	                    newLineTable = [0] * len(wantedColumns)
	                    tmp = 0
	                    for col in wantedColumns :
	                        #Copy the wanted column at in the new table
	                        newLineTable[tmp] = str(columnsTable[col])
	                        tmp += 1
	                    #Make up a new string from the newLineTable separated by tabs
	                    result = "\t".join(newLineTable)
	                    newFile.write(result+"\n")

    print("New file successfully created !")
    newFile.close()

#end of parseZipFolder


count = 1
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
        fileName = link[:len(link)-4]
        parseZipFolder(fileName)
        #Delete the now unnecessary zip file
        print("Removing temporary files")
        os.remove(link)
        shutil.rmtree(fileName)
        count = count + 1
        print("Progression : "+str(count)+" / "+str(fileLength))
#end of with


print("Program successfully terminated ! Congratulations !")
