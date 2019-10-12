import React from 'react';
import MetaTags from 'react-meta-tags';

function App(props) {
    return <>
        <MetaTags key="metatags">
            <meta charSet="utf-8" />
            <meta name="theme-color" content="#fff" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
            <meta name="format-detection" content="telephone=no" />
            <meta name="format-detection" content="address=no" />
            <meta httpEquiv="Cache-Control" content="no-cache" />
            <meta name="HandheldFriendly" content="True" />
            <meta name="viewport" content="initial-scale=1.0, user-scalable=no, maximum-scale=1.0" />
            <meta name="google" value="notranslate" />
            <meta name="keywords" content="vector editor illustrator online collage builder clever brush web2print digital printing publishing gift builder giftbuilder b2b collage maker photocollage photocollagemaker design vector image effect" />
            <meta name="description" content="CleverBrush is online vector image editor component for digital publishing. You can embed it on your web page as JavaScript library. Supports SVG, JPEG, PNG, PDF and other formats." />
            <link rel="canonical" href="https://www.cleverbrush.com" />
        </MetaTags>
        <div>i am isomorphic</div>
    </>
}

export default App;
