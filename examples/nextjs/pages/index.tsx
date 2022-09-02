import {
  ParticipantView,
  ConnectionQuality,
  LiveKitRoom,
  MediaControlButton,
  MediaSelect,
  TrackSource,
  Participants,
  ConnectionStatus,
  DisconnectButton,
  useToken,
  ScreenShareView,
  ParticipantName,
} from '@livekit/components-react';
import { RemoteParticipant } from 'livekit-client';

import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import styles from '../styles/Home.module.css';

// import '@livekit/components/dist/livekit-components.mjs';

const Home: NextPage = () => {
  const params = typeof window !== 'undefined' ? new URLSearchParams(location.search) : null;

  const roomName = params?.get('room') ?? 'test-room';
  const userIdentity = params?.get('user') ?? 'test-user';
  const [connect, setConnect] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const token = useToken(roomName, userIdentity, 'myname');

  const handleDisconnect = () => {
    setConnect(false);
    setIsConnected(false);
  };

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
        {/* <p>Status: {roomState.connectionState} <br/> Nr. of participants: {roomState.participants.length} </p> */}
        {!isConnected && (
          <button onClick={() => setConnect(!connect)}>{connect ? 'Disconnect' : 'Connect'}</button>
        )}
        {/* <Room connect={connect} /> */}
        <LiveKitRoom
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LK_SERVER_URL}
          connect={connect}
          onConnected={() => setIsConnected(true)}
          onDisconnected={handleDisconnect}
        >
          <ConnectionStatus />
          {/* <MediaSelection type="microphone"/>  */}
          {isConnected && (
            <>
              <div className="control-bar">
                <MediaControlButton source={TrackSource.Camera}></MediaControlButton>
                <MediaSelect kind={'videoinput'} />
                <MediaControlButton source={TrackSource.Microphone}></MediaControlButton>
                <MediaSelect kind={'audioinput'} />
                <MediaControlButton source={TrackSource.ScreenShare}></MediaControlButton>
                <DisconnectButton>Hang up!</DisconnectButton>
              </div>
              <ScreenShareView />
              <div className="participant-grid">
                <Participants>
                  {/* <Participants
                  filter={(participants) => participants.filter((p) => p instanceof RemoteParticipant)}
                > */}
                  <ParticipantView>
                    <ConnectionQuality className={'lk-signal-icon'} />
                    <ParticipantName />
                  </ParticipantView>
                </Participants>
              </div>
            </>
          )}
        </LiveKitRoom>
      </main>
    </div>
  );
};

export default Home;
