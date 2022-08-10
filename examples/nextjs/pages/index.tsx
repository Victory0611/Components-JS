import { useRoom, useToken } from '@livekit/auth-helpers-nextjs';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useCallback, useEffect } from 'react';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  const roomName = 'test-room';
  const userIdentity = 'test-user';
  const roomState = useRoom();
  const token = useToken(roomName, userIdentity);

  useEffect(() => {
        if(!token) return;
        if(!process.env.NEXT_PUBLIC_LK_SERVER_URL) {
          console.error('no livekit url provided');
          return;
        }
        roomState.room.connect(process.env.NEXT_PUBLIC_LK_SERVER_URL, token).catch((e: unknown) => {
          console.warn('could not connect', e);
        })
    }, [token]);
  
  return (
    <div className={styles.container}>
      <Head>
        <title>LiveKit Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://livekit.io">LiveKit</a> 
        </h1>
        <p>Status: {roomState.connectionState} <br/> Nr. of participants: {roomState.participants.length} </p>
      </main>
      
    </div>
  );
};

export default Home;
