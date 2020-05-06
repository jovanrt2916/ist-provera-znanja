const http = require('http');
const url = require('url');
const qs = require('querystring');
const fs = require('fs');

let server = http.createServer(routeHandler);

const port = 8080;
const host = 'localhost';

const pathToFiles = './client';

server.listen(port, host);
console.log(`Server started at address: http://${host}:${port}`);

let articles = [
    {
        id: 1,
        name: "Milk",
        price: 95,
        companyName: "Imlek D.O.O"
    },
    {
        id: 2,
        name: "Coffee",
        price: 200,
        companyName: "Bonito"
    }
];

function routeHandler(req, res) {
    let requestData = '';

    req.on('data', data => {
        requestData += data;
    });

    req.on('end', () => {
        let requestUrlData = url.parse(req.url);
        let requestPath = requestUrlData.pathname;

        if (requestPath === '/all-articles' && req.method === 'GET') {

            let parsedData = qs.decode(requestUrlData.query);
            let responseArticles = [];

            if (parsedData.companyName === undefined) {
                responseArticles = sviArtikli();
            } else if(parsedData.companyName !== null && parsedData.companyName !== '') {
                responseArticles = sviArtikli(parsedData.companyName);
            }

            res.writeHead(200);
            res.end(formatGetResponse(responseArticles));

        } else if (requestPath === '/delete' && req.method === 'GET') {

            let parsedData = qs.decode(requestUrlData.query);
            obrisiArtikal(parsedData.id);

            res.writeHead(302, {
                'Location': '/all-articles'
            });
            res.end();

        } else if (requestPath === '/add-article' && req.method === 'GET') {

            let responseHTML = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Title</title>
                </head>
                <body>
                <h2>Dodaj artikal</h2>
                
                    <form action="/add-article" method="POST">
                        ID: <input type="number" name="id">
                        Naziv: <input type="text" name="name">
                        Cena: <input type="number" name="price">
                        Kompanija: <input type="text" name="companyName">
                        <input type="submit" value="Dodaj artikal">
                    </form>
                    
                </body>
                </html>
            `;

            res.writeHead(200);
            res.end(responseHTML);

        } else if (requestPath === '/change-article' && req.method === 'GET') {

            let responseHTML = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Title</title>
                </head>
                <body>
                <h2>Dodaj artikal</h2>
                
                    <form action="/change-article" method="POST">
                        ID: <input type="number" name="id">
                        Naziv: <input type="text" name="name">
                        Cena: <input type="number" name="price">
                        Kompanija: <input type="text" name="companyName">
                        <input type="submit" value="Izmeni artikal">
                    </form>
                    
                </body>
                </html>
            `;

            res.writeHead(200);
            res.end(responseHTML);

        } else if (requestPath === '/add-article' && req.method === 'POST') {

            let parsedData = qs.decode(requestData);
            dodajArtikal(parseInt(parsedData.id), parsedData.name, parseFloat(parsedData.price), parsedData.companyName);

            res.writeHead(302, {
                'Location': '/all-articles'
            });
            res.end();

        } else if (requestPath === '/change-article' && req.method === 'POST') {

            let parsedData = qs.decode(requestData);
            izmeniArtiakal(parseInt(parsedData.id), parsedData.name, parseFloat(parsedData.price), parsedData.companyName);

            res.writeHead(302, {
                'Location': '/all-articles'
            });
            res.end();

        }

    });
}

function sviArtikli(companyName = '') {

    console.log(companyName);
    if (companyName === '') return articles;

    let resArticles = [];

    articles.forEach(article => {
        console.log(article.companyName + ' is current article company');
        console.log(companyName + ' is asked article company');

        if (article.companyName === companyName) {
            resArticles.push(article);
        }
    });

    return resArticles;
}

function obrisiArtikal(id) {
    articles.forEach((value, index) => {
        if (value.id === parseInt(id)) {
            articles.splice(index, 1);
        }
    });
}

function dodajArtikal(id, name, price, companyName) {
    articles.push({
        id: id,
        name: name,
        price: price,
        companyName: companyName
    });
}

function izmeniArtiakal(id, name, price, companyName) {
    let articleToChange = {};

    articles.forEach(article => {
        if (article.id === id) {
            articleToChange = article;
        }
    });

    articleToChange.name = name;
    articleToChange.price = price;
    articleToChange.companyName = companyName;
}

function formatGetResponse(data) {
    let articlesData = '';

    data.forEach(article => {
        articlesData += `
            <tr>
                <td>${article.id}</td>
                <td>${article.name}</td>
                <td>${article.price}</td>
                <td>${article.companyName}</td>
            </tr>
        `;
    });

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Title</title>
        </head>
        <body>
        <h2>Artikli</h2>
        
            <table border="1">
                <thead>
                <tr>
                    <th>Id</th>
                    <th>Naziv</th>
                    <th>Cena</th>
                    <th>Kompanija</th>
                </tr>
                </thead>
            
                <tbody id="articles">
                    ${articlesData}
                </tbody>
            </table>
        </body>
        </html>
    `;
}
