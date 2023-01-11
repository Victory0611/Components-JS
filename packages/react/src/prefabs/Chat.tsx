import { setupChat } from '@livekit/components-core';
import * as React from 'react';
import { useRoomContext } from '../context';
import { cloneSingleChild, useObservableState } from '../utils';
import { ChatEntry } from './ChatEntry';

export type ChatProps = React.HTMLAttributes<HTMLDivElement>;

export function useChat() {
  const room = useRoomContext();
  const { isSendingObservable, messageObservable, send } = React.useMemo(
    () => setupChat(room),
    [room],
  );
  const isSending = useObservableState(isSendingObservable, false);
  const chatMessages = useObservableState(messageObservable, []);
  return { send, chatMessages, isSending };
}

/**
 * The Chat component adds a basis chat functionality to the LiveKit room. The messages are distributed to all participants
 * in the room. Only users who are in the room at the time of dispatch will receive the message.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <Chat />
 * </LiveKitRoom>
 * ```
 */
export function Chat({ ...props }: ChatProps) {
  const { send, chatMessages, isSending } = useChat();
  const handleSend = async () => {
    if (inputRef.current && inputRef.current.value.trim() !== '') {
      await send(inputRef.current.value);
      inputRef.current.value = '';
    }
  };
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div {...props} className="lk-chat">
      <ul className="lk-chat-messages">
        {props.children
          ? chatMessages.map((msg, idx) =>
              cloneSingleChild(props.children, { entry: msg, key: idx }),
            )
          : chatMessages.map((msg, idx) => <ChatEntry key={idx} entry={msg} />)}
      </ul>
      <div className="lk-chat-form">
        <input
          className="lk-form-control lk-chat-form-input"
          disabled={isSending}
          ref={inputRef}
          type="text"
          placeholder="Enter a message..."
        ></input>
        <button className="lk-button lk-chat-form-button" disabled={isSending} onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}
