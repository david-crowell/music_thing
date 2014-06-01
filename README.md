Dave's music thing.

Things to know: I haven't worked out the config-in-environment-variables thing yet, so to build this:

cp testconfig.js config.js

Edit config.js to use your echonest API key

foreman start

this version of the site scrapes setlist.fm, because I didn't realzie they had an API...