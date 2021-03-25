/**
 * constants
 */

const express = require("express");
const path = require('path');
const bodyParser = require('body-parser'); // needed to read the content from the form

const PORT = process.env.PORT || 5000
const sqlite3 = require("sqlite3");
const dbname = "tatoeba.db";

/**
 * using express and the body-parser module
 */
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * opening the database
 */
let db = new sqlite3.Database(dbname, err => {
    if (err) {
        throw err
    }

    console.log(`Database started on ${dbname}`);

});

/**
 * EJS
 * concatenating the current working directory
 * and a folder called views
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
 
 /**
  * serving static files from the "public" folder
  * this includes: image, HTML and JS files, etc.
  */
app.use(express.static(path.resolve(__dirname, 'public')));

/**
 * EJS template 1
 */
 app.get('/', (req, res) => {
    res.status(200).render("index");
});

/**
 * EJS template 3
 */
app.get('/get-data-form', (req, res) => {

    // corpus
    const corpus = 
    [
        "fr_de_tb"
    ]

    const generateQuery = () => {
        let queryString;
        let union = "";

        /**
         * This nested SELECT statement needs to be done because
         * of a SQLite quirk with ORDER BY.
         * 
         * https://scottstoecker.wordpress.com/2020/06/05/using-order-by-with-a-union-in-sqlite/
         */
        // queryString = "SELECT * FROM (";
        
        /**
         * loop on each corpus item to build the query
         */
        // for (let i = 0; i < corpus.length; i++) {
        //     queryString += `SELECT * FROM ${corpus[i]}
        //     WHERE ${req.query.language}
        //     LIKE "%${req.query.searchQuery}%"`;
        // } // end of loop

        queryString = `SELECT * FROM ${corpus}
        WHERE ${req.query.language}
        LIKE "%${req.query.searchQuery}%"`;

        /**
         * end of nested statement that needs to be performed
         * because of a SQLite quirk with ORDER BY
         */
        // queryString += "\n\n)";

        /**
         * order by length in characters
         */
        queryString += `\n\nORDER BY LENGTH(passage_fr);`;
        // console.log(queryString);

        return queryString;
    }

    // // string to search
    // const queryString = `
    //     SELECT * FROM le_grand_meaulnes_tb
    //     WHERE ${req.query.language}
    //     LIKE "%${req.query.searchQuery}%";
    // `;

    /**
     * generates the query before running it
     */
    const generatedQuery = generateQuery();

    db.all(generatedQuery, (err, data) => {

        // new stuff
        if (err) {
            res.status(200).send("There seems to be a problem with this query...");
            console.log(err);
            // console.log(`The SQLite query is: "${sql}"...`);

        } else {
            console.log(`Displaying data for "${req.query.searchQuery}"...`);
            // console.log(`The SQLite query is: "${sql}"...`);

            for (let i = 0; i < data.length; i++) {
                const re = new RegExp(req.query.searchQuery, "gi");
                let newStrFr = data[i].passage_fr.replace(re, `zzzz-openstrongtag-zzzz${req.query.searchQuery.toUpperCase()}zzzz-closestrongtag-zzzz`);
                let newStrEn = data[i].passage_autre.replace(re, `zzzz-openstrongtag-zzzz${req.query.searchQuery.toUpperCase()}zzzz-closestrongtag-zzzz`);

                data[i].passage_fr = newStrFr;
                data[i].passage_autre = newStrEn;
            }

            res.status(200).render("page-resultats", {
                data : data,
                queryTerm: req.query.searchQuery
            });
        }
        // end new stuff

    });


});

/**
 * handling 404 errors
 * source: https://expressjs.com/en/starter/faq.html
 */
app.use(function (req, res, next) {
    res.status(404).send("404 - Sorry can't find that!")
});

/**
 * handling connections to the server
 */
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

/**
 * closing the database - ideally, you should do this
 */
// db.close(err => {
//     if (err) {
//         throw err;
//     }
//     console.log(`Databased closed.`);
// });
