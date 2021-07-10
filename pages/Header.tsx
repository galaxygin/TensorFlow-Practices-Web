import Head from 'next/head'
export default function Header({ title = "TensorFlow Practices Web", url = "", thumbnail_url = "/assets/images/tensorflow-icon.png" }) {
    return <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="theme-color" content="#118b92" />

        <title>{title}</title>
        <meta name="description" content={"TensorFlow project samples working on browser"} />

        <meta property="og:site_name" content="TensorFlow Practices Web" />
        <meta property="og:title" content={title} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={thumbnail_url} />
        <meta property="og:description" content={"TensorFlow project samples working on browser"} />
        <meta property="og:type" content={"image"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        {/* <meta name="twitter:image" content={thumbnail_url} /> */}
    </Head>
}