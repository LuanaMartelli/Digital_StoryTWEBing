"""
This programm will download all data from GDELT, parse it and then delete the unecessary files
"""
import zipfile
import glob
import os
import urllib.request
import shutil


def download_db(destination, links, columns):
    """ This function will download the wanted links into the wanted folder while parsing it """
    file_length = sum(1 for line in open(links))
    count = 1
    with open(links, "r", encoding="utf8") as read_file:
        for link in read_file:
            #Remove the escape character
            link = link[:len(link) - 1]

            #Download and save file
            front = "http://data.gdeltproject.org/events/"
            print("\nDownloading " + front + link + "...")
            urllib.request.urlretrieve(front + link, link)
            print("File Downloaded !")

            #Unzip and parse the retrieved file
            file_name = link[:len(link) - 4]

            print("The program will now parse the file \"" + file_name + "\"")
            print("Zip file extraction...")
            zip_ref = zipfile.ZipFile("./" + file_name + ".zip", "r")
            zip_ref.extractall('./' + file_name + '/')
            zip_ref.close()
            print("File unzipped !")

            print("Parsing csv file...")

            new_file = open(destination + "/" + file_name + ".csv", "w", encoding="utf8")

            #For each csv file that has been extracted from the zip :
            for filename in glob.glob(os.path.join(file_name, '*.csv')):
                with open(filename, "r", encoding="utf8") as write_file:
                    for line in write_file:
                        split = line.split("\t")
                        code = split[28]
                        if code == "07":
                            #Filter the results to have only interesting columns
                            
                            columns_table = line.split('\t')
                            new_line_table = [0] * len(columns)
                            tmp = 0
                            for col in columns:
                                #Copy the wanted column at in the new table
                                new_line_table[tmp] = str(
                                    columns_table[col])
                                tmp += 1
                            #Make up a new string from the new_line_table separated by tabs
                            #Only if new_line_tables has no empty elements
                            if not '' in new_line_table:
                                result = "\t".join(new_line_table)
                                result = result.rstrip("\n")
                                new_file.write(result+"\n")
                            

            print("New file successfully created at "+ new_file.name)
            new_file.close()

            #Delete the now unnecessary zip file
            print("Removing temporary files")
            os.remove(link)
            shutil.rmtree(file_name)
            count = count + 1
            print("Progression : " + str(count) + " / " + str(file_length))
    #end of with
#end of download_db

DB1_LOCATION = "../data/DB_1"
DB2_LOCATION = "../data/DB_2"
DB1_LINKS = "allzips.txt"
DB2_LINKS = "allzips_with_url.txt"
WANTED_COLUMNS_DB1 = [1, 7, 17, 26]
WANTED_COLUMNS_DB2 = [57]

print("Welcome to the ultimate GDELT file downloader !")
print("This program will now make a two new DB based on GDELT")
print("The first one will be about all the links between the contries and their codes")
print("The second one will be about all the newspapers")
print("When finished the DBs will be parsed and distributed in their needed places")
print("And the two uneeded DB will be deleted")
print("Let's get started !")

#create Working Directory if doesn't exists
if not os.path.exists(DB1_LOCATION):
    os.makedirs(DB1_LOCATION)
    download_db(DB1_LOCATION, DB1_LINKS, WANTED_COLUMNS_DB1)
if not os.path.exists(DB2_LOCATION):
    os.makedirs(DB2_LOCATION)
    download_db(DB2_LOCATION, DB2_LINKS, WANTED_COLUMNS_DB2)

#parse the files to create links.csv
LINKS_FILE = open("../docs/scripts/links/links.csv", "w", encoding="utf8")
#LINKS_FILE = open("./links.csv", "w", encoding="utf8")
LINKS_FILE.write("actorA,actorB\n")
links_list = []
#For each csv file :
for filename in glob.glob(os.path.join(DB1_LOCATION, '*.csv')):
    with open(filename, "r", encoding="utf8") as f:
        print(f.name)
        for line in f:
            split = line.split("\t")
            actor1 = split[1]
            actor2 = split[2]
            if actor1 == actor2:
                continue
            result = actor1 + "," + actor2
            index = -1
            for i in range (0,len(links_list)):
                if links_list[i][0] == result:
                    index = i
                    break
            
            if index == -1:
                links_list.append([result, 1])
            else:
                links_list[index][1] = links_list[index][1] + 1

print("Writing links.csv...")
links_list.sort(key=lambda x: x[0])
for i in range(0, len(links_list)):
    LINKS_FILE.write(links_list[i][0]+"\n")

print("links.csv successfully created !")
LINKS_FILE.close()

#parse links.csv file to create couples.csv
COUPLES_FILE = open("../docs/scripts/couples/couples.csv", "w", encoding="utf8")
#COUPLES_FILE = open("./couples.csv", "w", encoding="utf8")
print("Writing couples.csv...")
COUPLES_FILE.write("countries,value")
links_list = sorted(links_list, key=lambda x: x[1], reverse=True)
for i in range(0, len(30)): #Just take the top 30
    array = links_list[i][0]
    array = array.replace(",","-")
    COUPLES_FILE.write(array+","+str(links_list[i][1])+"\n")
COUPLES_FILE.close()


#parse the files to create codes.csv

#parse the files to create newspapers.csv

#delete the now uneeded DB1 and DB2
#shutil.rmtree(DB1_LOCATION)
#shutil.rmtree(DB2_LOCATION)


print("Program successfully terminated ! Congratulations !")
