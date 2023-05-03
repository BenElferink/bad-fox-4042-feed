import Head from 'next/head'
import { AppProps } from 'next/app'
import { Fragment } from 'react'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { WalletProvider } from '@/contexts/WalletContext'
import { RenderProvider } from '@/contexts/RenderContext'
import '@/styles/globals.css'

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <Fragment>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <meta name='author' content='Ben Elferink' />
        {/* <meta name='description' content='' /> */}
        {/* <meta name='keywords' content='' /> */}

        <link rel='icon' type='image/x-icon' href='/favicon.ico' />
        <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
        <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
        <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
        <link rel='manifest' href='/manifest.json' />

        <title>4042</title>
      </Head>

      <Toaster />
      <RenderProvider>
        <WalletProvider>
          <Header />
          <main className='w-screen min-h-[calc(100vh-150px)] bg-black bg-opacity-40'>
            <Component {...pageProps} />
          </main>
          <Footer />
        </WalletProvider>
      </RenderProvider>
    </Fragment>
  )
}

export default App
