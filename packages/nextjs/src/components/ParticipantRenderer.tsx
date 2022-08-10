import React, { CSSProperties, ReactElement } from 'react';

import { Property } from 'csstype';
import { Participant } from 'livekit-client';
import { useParticipant, VideoRenderer } from '@livekit/react-core';

export interface ParticipantProps {
  participant: Participant;
  displayName?: string;
  // width in CSS
  width?: Property.Width;
  // height in CSS
  height?: Property.Height;
  className?: string;
  // aspect ratio width, if set, maintains aspect ratio
  aspectWidth?: number;
  // aspect ratio height
  aspectHeight?: number;
  // determine whether to contain or cover video.
  // cover mode is used when layout orientation matches video orientation
  orientation?: 'landscape' | 'portrait';
  // true if overlay with participant info should be shown
  showOverlay?: boolean;
  // true if connection quality should be shown
  showConnectionQuality?: boolean;
  // additional classname when participant is currently speaking
  speakerClassName?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

export const ParticipantView = ({
  participant,
  width,
  height,
  aspectWidth,
  aspectHeight,
  orientation,
  displayName,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: ParticipantProps) => {
  const { cameraPublication, isLocal } = useParticipant(participant);

  const containerStyles: CSSProperties = {
    width: width,
    height: height,
  };

  // when aspect matches, cover instead
  let objectFit: Property.ObjectFit = 'contain';
  let videoOrientation: 'landscape' | 'portrait' | undefined;
  if (!orientation && aspectWidth && aspectHeight) {
    orientation = aspectWidth > aspectHeight ? 'landscape' : 'portrait';
  }
  if (cameraPublication?.dimensions) {
    videoOrientation =
      cameraPublication.dimensions.width > cameraPublication.dimensions.height
        ? 'landscape'
        : 'portrait';
  }

  if (videoOrientation === orientation) {
    objectFit = 'cover';
  }

  if (!displayName) {
    displayName = participant.name || participant.identity;
    if (isLocal) {
      displayName += ' (You)';
    }
  }

  let mainElement: ReactElement;
  if (cameraPublication?.isSubscribed && cameraPublication?.track && !cameraPublication?.isMuted) {
    mainElement = (
      <VideoRenderer
        track={cameraPublication.track}
        isLocal={isLocal}
        objectFit={objectFit}
        width="100%"
        height="100%"
      />
    );
  } else {
    mainElement = <div />;
  }

  return (
    <div
      style={containerStyles}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {mainElement}
    </div>
  );
};
