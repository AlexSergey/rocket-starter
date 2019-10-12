import express from "express";
import path from "path";

import React from "react";
import { renderToString } from "react-dom/server";
import App from "../../client/src/App";
import {MetaTagsContext} from 'react-meta-tags';
import MetaTagsServer from 'react-meta-tags/server';

const app = express();

app.use(express.static( path.resolve(__dirname, 'dist')));

app.get( "/*", ( req, res ) => {
    const metaTagsInstance = MetaTagsServer();
    const jsx = <MetaTagsContext extract = {metaTagsInstance.extract}>
        <App />
    </MetaTagsContext>;
    const reactDom = renderToString( jsx );

    res.writeHead( 200, { "Content-Type": "text/html" } );

    let meta = metaTagsInstance.renderToString();

    res.end( htmlTemplate( reactDom, meta ) );
} );

app.listen(2048, () => {
    console.log(`LiveReload connected to ${process.env.__LIVE_RELOAD__} port`);
    console.log(`http://localhost:${2048}/`);
    console.log(`Server connected to ${2048} port`);
});

function htmlTemplate( reactDom, meta ) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            ${meta}
        </head>
        
        <body>
            <div id="app">${ reactDom }</div>
            <script src="./index.js"></script>
            ${process.env.NODE_ENV=== 'development' && process.env.__LIVE_RELOAD__ ?
                `<script src="http://localhost:${process.env.__LIVE_RELOAD__}/livereload.js"></script>` :
                ''
            }
        </body>
        </html>
    `;
}
