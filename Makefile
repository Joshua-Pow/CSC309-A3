#
# Makefile
#
# CSC309 Assignment 3
#
# There is only 1 command, which deletes all
# files that you should not submit, except
# for the virtual environment (venv).
#

NOADD  := db.sqlite3 $(wildcard *.tar)
FILES  := $(filter-out $(NOADD), $(wildcard *))
OUTPUT := $(notdir $(abspath .))

all: zip

.PHONY: clean zip setup
clean:
	rm -rf */__pycache__/ */*/__pycache__/ */*/*/__pycache__/ */migrations/0*.py
	rm -rf $(NOADD) *~ *.tar
	
setup: clean
	chmod a+x ./manage.py
	./manage.py makemigrations
	./manage.py migrate
	./manage.py loaddata a3.json

zip: clean
	tar cvf $(OUTPUT).tar $(FILES)
