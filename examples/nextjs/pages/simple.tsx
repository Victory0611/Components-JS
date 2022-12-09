import {
  ParticipantView,
  ConnectionQualityIndicator,
  LiveKitRoom,
  TrackToggle,
  TrackSource,
  ParticipantsLoop,
  ConnectionState,
  DisconnectButton,
  UseTokenProps,
  ScreenShareView,
  ParticipantName,
  TrackMutedIndicator,
  RoomName,
  RoomAudioRenderer,
  MediaTrack,
  MediaDeviceSelect,
  MediaDeviceMenu,
  useToken,
} from '@livekit/components-react';
import { RemoteParticipant, Track } from 'livekit-client';

import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import styles from '../styles/Simple.module.css';

const Home: NextPage = () => {
  const params = typeof window !== 'undefined' ? new URLSearchParams(location.search) : null;

  const roomName = params?.get('room') ?? 'test-room';
  const userIdentity = params?.get('user') ?? 'test-user';
  const [connect, setConnect] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const token = useToken({
    tokenEndpoint: process.env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT,
    roomName,
    userInfo: {
      identity: userIdentity,
      name: 'myname',
    },
  });
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
        {!isConnected && (
          <button onClick={() => setConnect(!connect)}>{connect ? 'Disconnect' : 'Connect'}</button>
        )}
        <LiveKitRoom
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LK_SERVER_URL}
          connect={connect}
          onConnected={() => setIsConnected(true)}
          onDisconnected={handleDisconnect}
          audio={true}
          video={true}
        >
          <RoomName />
          <ConnectionState />
          <RoomAudioRenderer />
          {isConnected && (
            <>
              <div className={styles.controlBar}>
                <TrackToggle source={TrackSource.Camera}></TrackToggle>
                <MediaDeviceMenu kind={'videoinput'} />
                <TrackToggle source={TrackSource.Microphone}></TrackToggle>
                <MediaDeviceMenu kind={'audioinput'} />
                <TrackToggle source={TrackSource.ScreenShare}></TrackToggle>
                <DisconnectButton>Hang up!</DisconnectButton>
                <div
                  style={{
                    border: '1px lightgray solid',
                    borderRadius: '0.5rem',
                    padding: '.5rem',
                  }}
                >
                  <div>
                    <div>Audio Inputs:</div>
                    <MediaDeviceSelect kind="audioinput"></MediaDeviceSelect>
                  </div>
                  <div>
                    <div>Video Inputs:</div>
                    <MediaDeviceSelect kind="videoinput"></MediaDeviceSelect>
                  </div>
                </div>
              </div>
              <ScreenShareView />
              <div className={styles.participantGrid}>
                <ParticipantsLoop>
                  <ParticipantView>
                    <MediaTrack source={Track.Source.Camera}></MediaTrack>

                    <div className={styles.participantIndicators}>
                      <div style={{ display: 'flex' }}>
                        <TrackMutedIndicator source={Track.Source.Camera}></TrackMutedIndicator>
                        <TrackMutedIndicator source={Track.Source.Microphone}></TrackMutedIndicator>
                      </div>
                      <ParticipantName />
                      <ConnectionQualityIndicator />
                    </div>
                  </ParticipantView>
                </ParticipantsLoop>
              </div>
            </>
          )}
        </LiveKitRoom>
      </main>
    </div>
  );
};

export default Home;
