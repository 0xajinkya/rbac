echo "dropping databases in postgres in test mode."
PGPASSWORD=password psql -U postgres -p 5432 -c 'DROP DATABASE sbac_test;' # &> output.txt
exit 0