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
                with open(filename, encoding="utf8") as write_file:
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
print(
    "The first one will be about all the links between the contries and their codes"
)
print("The second one will be about all the newspapers")
print("Let's get started !")

#create Working Directory if doesn't exists
if not os.path.exists(DB1_LOCATION):
    os.makedirs(DB1_LOCATION)
if not os.path.exists(DB2_LOCATION):
    os.makedirs(DB2_LOCATION)

download_db(DB1_LOCATION, DB1_LINKS, WANTED_COLUMNS_DB1)
download_db(DB2_LOCATION, DB2_LINKS, WANTED_COLUMNS_DB2)

print("Program successfully terminated ! Congratulations !")
