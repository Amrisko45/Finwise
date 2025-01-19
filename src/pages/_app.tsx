import '../app/globals.css';
import type { AppProps } from 'next/app';
import Navbar from '../components/NavBar';
import Head from 'next/head';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>AI-Integrated Finance Tracker</title> {/* Default title */}
      </Head>
      <Navbar />
      <main>
        <Component {...pageProps} />
      </main>
    </>
  );
}
