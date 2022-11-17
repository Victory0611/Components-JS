import { roomEventSelector } from '@livekit/components-core';
import {
  AudioCaptureOptions,
  ConnectionState,
  Room,
  RoomConnectOptions,
  RoomEvent,
  RoomOptions,
  ScreenShareCaptureOptions,
  VideoCaptureOptions,
} from 'livekit-client';
import * as React from 'react';
import { RoomContext } from '../contexts';
import { DefaultRoomView } from '../prefabs/DefaultRoomView';

export type LiveKitRoomProps = {
  children?: React.ReactNode | React.ReactNode[];
  serverUrl?: string;
  token?: string;
  room?: Room;
  options?: RoomOptions;
  connectOptions?: RoomConnectOptions;
  audio?: AudioCaptureOptions | boolean;
  video?: VideoCaptureOptions | boolean;
  screen?: ScreenShareCaptureOptions | boolean;
  connect?: boolean;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
};

// type RoomContextState = {
//   room: Room;
//   connectionState: ConnectionState;
//   participants: Participant[];
//   audioTracks: AudioTrack[];
// };

interface UserInfo {
  identity?: string;
  name?: string;
  metadata?: string;
}

export function useToken(tokenEndpoint: string | undefined, roomName: string, userInfo?: UserInfo) {
  const [token, setToken] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (tokenEndpoint === undefined) {
      throw Error('token endpoint needs to be defined');
    }
    if (userInfo?.identity === undefined) {
      return;
    }
    const tokenFetcher = async () => {
      console.log('fetching token');
      const params = new URLSearchParams({ ...userInfo, roomName });
      const res = await fetch(`${tokenEndpoint}?${params.toString()}`);
      const { accessToken } = await res.json();
      setToken(accessToken);
    };
    tokenFetcher();
  }, [tokenEndpoint, roomName]);
  return token;
}

const defaultRoomProps: LiveKitRoomProps = {
  connect: true,
  audio: false,
  video: false,
};
export const useLiveKitRoom = (props: LiveKitRoomProps) => {
  const {
    token,
    serverUrl,
    options,
    room: passedRoom,
    connectOptions,
    connect,
    audio,
    video,
    screen,
    onConnected,
    onDisconnected,
    onError,
  } = { ...defaultRoomProps, ...props };
  if (options && passedRoom) {
    console.warn(
      'when using a manually created room, the options object will be ignored. set the desired options directly when creating the room instead.',
    );
  }
  const [room] = React.useState<Room>(passedRoom ?? new Room(options));
  // setLogLevel('debug');

  React.useEffect(() => {
    const onSignalConnected = () => {
      const localP = room.localParticipant;
      try {
        localP.setMicrophoneEnabled(!!audio, typeof audio !== 'boolean' ? audio : undefined);
        localP.setCameraEnabled(!!video, typeof video !== 'boolean' ? video : undefined);
        localP.setScreenShareEnabled(!!screen, typeof screen !== 'boolean' ? screen : undefined);
      } catch (e: any) {
        console.warn(e);
        onError?.(e as Error);
      }
    };
    room.on(RoomEvent.SignalConnected, onSignalConnected);

    return () => {
      room.off(RoomEvent.SignalConnected, onSignalConnected);
    };
  }, [room.state, audio, video, screen]);

  React.useEffect(() => {
    if (!token) {
      return;
    }
    if (!serverUrl) {
      console.warn('no livekit url provided');
      onError?.(Error('no livekit url provided'));
      return;
    }
    if (connect) {
      room.connect(serverUrl, token, connectOptions).catch((e: any) => {
        console.warn(e);
        onError?.(e as Error);
      });
    } else {
      room.disconnect();
    }
  }, [connect, token]);

  React.useEffect(() => {
    const connectionStateChangeListener = roomEventSelector(
      room,
      RoomEvent.ConnectionStateChanged,
    ).subscribe(([state]) => {
      switch (state) {
        case ConnectionState.Disconnected:
          if (onDisconnected) onDisconnected();
          break;
        case ConnectionState.Connected:
          if (onConnected) onConnected();
          break;

        default:
          break;
      }
    });
    return () => connectionStateChangeListener.unsubscribe();
  }, [token]);
  return room;
};

/**
 * The LiveKitRoom component provides the room context to all its child components.
 * It is generally the starting point of your LiveKit app and the root of the LiveKit component tree.
 * It provides the room state as a React context to all child components, so you don't have to pass it yourself.
 *
 * @example
 * ```
 * import { LiveKitRoom } from '@livekit/components-react';
 *
 * <LiveKitRoom
 *  token='<livekit-token>'
 *  serverUrl='<url-to-livekit-server>'
 *  connect={true}
 * >
 *     {...}
 * </LiveKitRoom>
 * ```
 */
export const LiveKitRoom = (props: LiveKitRoomProps) => {
  const room = useLiveKitRoom(props);
  return (
    <RoomContext.Provider value={room}>
      {props.children ?? <DefaultRoomView />}
    </RoomContext.Provider>
  );
};
