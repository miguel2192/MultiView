"""
Title: Json2Mongo
Date: 6/22/2017
Description: imports json files into mongoDB


Author: Miguel Rodriguez ***miguelrdrgz47@gmail.com***

#param: dir_name


"""

from pymongo import MongoClient
import json
import os


# setup mongo
MONGODB_HOST = "localhost"
MONGODB_PORT = 27017

# connect to the database & get a gridfs handle
mongo_con = MongoClient(MONGODB_HOST, MONGODB_PORT)
mongo_db = mongo_con["scientific_data_json"]
mongo_col = mongo_db['data']


def add_json(dir_name):

	directory = os.getcwd() + '/'+ dir_name +'/'

	for filename in os.listdir(directory):
		if filename.endswith(".json"):
			with open(directory + filename, 'r') as f:
				data = json.load(f)
			print('Inserting Json files in the database...')
			mongo_col.insert(data)
		else:
			print('Files is not Json')

def rm_all():
	
	mongo_col.delete_many({})
	print('All items in collection were removed!')

def db_count():

	fileNum = mongo_col.count()

	print('There are ' + str(fileNum) + '  files in the database!')


def find_one():

	for post in mongo_col.find({"body.datafile.children.protocol.start_timestamp" : "1483657272.9295976"}):
		print(post)






def main():

	#adds json files to mongoDB
	# add_json('resultsJson')

	#determine how many files in the db
	db_count()

	find_one()

	#removes all json objects from mongoDB
	# rm_all()


if __name__ == '__main__':
	main()